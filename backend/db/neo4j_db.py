from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

URI      = os.getenv("NEO4J_URI", "bolt://localhost:7687")
USER     = os.getenv("NEO4J_USER", "neo4j")
PASSWORD = os.getenv("NEO4J_PASSWORD", "password123")

driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))

def get_neo4j():
    return driver

# ── Seed data: Web Development knowledge graph (35 nodes) ──────────
TOPICS = [
    # (id, name, domain, difficulty 1-5, description)
    ("html_basics",       "HTML Basics",           "Web Dev", 1, "Structure of web pages using HTML tags"),
    ("css_basics",        "CSS Basics",             "Web Dev", 1, "Styling web pages with CSS"),
    ("js_basics",         "JavaScript Basics",      "Web Dev", 1, "Core JS: variables, loops, functions"),
    ("dom",               "DOM Manipulation",       "Web Dev", 2, "Interact with HTML via JavaScript"),
    ("css_flexbox",       "CSS Flexbox",            "Web Dev", 2, "Modern CSS layout with flexbox"),
    ("css_grid",          "CSS Grid",               "Web Dev", 2, "2D CSS layout system"),
    ("responsive",        "Responsive Design",      "Web Dev", 2, "Mobile-first, media queries"),
    ("es6",               "ES6+ Features",          "Web Dev", 2, "Arrow fn, destructuring, modules"),
    ("async_js",          "Async JavaScript",       "Web Dev", 3, "Promises, async/await, fetch API"),
    ("react_basics",      "React Basics",           "Web Dev", 3, "Components, JSX, props"),
    ("react_hooks",       "React Hooks",            "Web Dev", 3, "useState, useEffect, custom hooks"),
    ("react_router",      "React Router",           "Web Dev", 3, "Client-side routing in React"),
    ("state_mgmt",        "State Management",       "Web Dev", 4, "Redux Toolkit / Zustand"),
    ("node_basics",       "Node.js Basics",         "Web Dev", 2, "Server-side JS, modules, npm"),
    ("express",           "Express.js",             "Web Dev", 3, "REST APIs with Express"),
    ("rest_api",          "REST API Design",        "Web Dev", 3, "HTTP methods, status codes, design"),
    ("auth_jwt",          "Auth & JWT",             "Web Dev", 3, "Authentication, JWT tokens"),
    ("mongodb",           "MongoDB",                "Web Dev", 3, "NoSQL database with Mongoose"),
    ("sql_basics",        "SQL Basics",             "Web Dev", 2, "SELECT, JOIN, indexes"),
    ("postgres",          "PostgreSQL",             "Web Dev", 3, "Relational DB, ACID, advanced SQL"),
    ("git",               "Git & GitHub",           "Web Dev", 1, "Version control basics"),
    ("testing",           "Testing (Jest/Vitest)",  "Web Dev", 3, "Unit and integration testing"),
    ("typescript",        "TypeScript",             "Web Dev", 3, "Static typing for JavaScript"),
    ("graphql",           "GraphQL",                "Web Dev", 4, "Query language for APIs"),
    ("docker",            "Docker",                 "Web Dev", 4, "Containerization basics"),
    ("deployment",        "Deployment (Vercel/Railway)", "Web Dev", 3, "Deploy frontend and backend"),
    ("web_security",      "Web Security",           "Web Dev", 4, "XSS, CSRF, HTTPS, OWASP"),
    ("performance",       "Web Performance",        "Web Dev", 4, "Lazy loading, caching, Lighthouse"),
    ("pwa",               "Progressive Web Apps",   "Web Dev", 4, "Service workers, offline support"),
    ("websockets",        "WebSockets",             "Web Dev", 4, "Real-time bidirectional communication"),
]

# Prerequisite edges: (from, to) meaning "from" must be learned before "to"
EDGES = [
    ("html_basics",  "css_basics"),
    ("html_basics",  "js_basics"),
    ("css_basics",   "css_flexbox"),
    ("css_basics",   "css_grid"),
    ("css_flexbox",  "responsive"),
    ("css_grid",     "responsive"),
    ("js_basics",    "dom"),
    ("js_basics",    "es6"),
    ("es6",          "async_js"),
    ("async_js",     "react_basics"),
    ("react_basics", "react_hooks"),
    ("react_hooks",  "react_router"),
    ("react_router", "state_mgmt"),
    ("es6",          "typescript"),
    ("typescript",   "react_basics"),
    ("js_basics",    "node_basics"),
    ("node_basics",  "express"),
    ("express",      "rest_api"),
    ("rest_api",     "auth_jwt"),
    ("rest_api",     "mongodb"),
    ("sql_basics",   "postgres"),
    ("node_basics",  "sql_basics"),
    ("auth_jwt",     "web_security"),
    ("rest_api",     "graphql"),
    ("react_basics", "testing"),
    ("express",      "testing"),
    ("deployment",   "docker"),
    ("rest_api",     "deployment"),
    ("react_router", "deployment"),
    ("async_js",     "websockets"),
    ("responsive",   "pwa"),
    ("react_hooks",  "performance"),
]

def init_graph():
    """Seed the Neo4j graph with topics and prerequisites."""
    with driver.session() as session:
        # Clear existing
        session.run("MATCH (n:Topic) DETACH DELETE n")

        # Create topic nodes
        for t in TOPICS:
            session.run(
                """
                CREATE (t:Topic {
                    id: $id, name: $name, domain: $domain,
                    difficulty: $difficulty, description: $desc
                })
                """,
                id=t[0], name=t[1], domain=t[2], difficulty=t[3], desc=t[4]
            )

        # Create prerequisite edges
        for src, dst in EDGES:
            session.run(
                """
                MATCH (a:Topic {id: $src}), (b:Topic {id: $dst})
                CREATE (a)-[:PREREQUISITE_OF]->(b)
                """,
                src=src, dst=dst
            )
    print("Neo4j graph seeded successfully.")

def get_all_topics():
    with driver.session() as session:
        result = session.run(
            "MATCH (t:Topic) RETURN t.id as id, t.name as name, "
            "t.domain as domain, t.difficulty as difficulty, t.description as description"
        )
        return [dict(r) for r in result]

def get_graph_data():
    """Return nodes + links for react-force-graph."""
    with driver.session() as session:
        nodes_r = session.run(
            "MATCH (t:Topic) RETURN t.id as id, t.name as name, "
            "t.difficulty as difficulty, t.domain as domain"
        )
        links_r = session.run(
            "MATCH (a:Topic)-[:PREREQUISITE_OF]->(b:Topic) "
            "RETURN a.id as source, b.id as target"
        )
        nodes = [dict(r) for r in nodes_r]
        links = [dict(r) for r in links_r]
        return {"nodes": nodes, "links": links}

def get_learning_path(known_topic_ids: list[str]):
    """
    Returns an ordered learning path using topological sort,
    excluding topics the user already knows.
    """
    with driver.session() as session:
        result = session.run(
            """
            MATCH (t:Topic)
            WHERE NOT t.id IN $known
            OPTIONAL MATCH (pre:Topic)-[:PREREQUISITE_OF]->(t)
            WITH t, collect(pre.id) as prereqs
            WHERE ALL(p IN prereqs WHERE p IN $known OR p IS NULL)
            RETURN t.id as id, t.name as name, t.difficulty as difficulty,
                   t.description as description, prereqs
            ORDER BY t.difficulty ASC
            """,
            known=known_topic_ids
        )
        return [dict(r) for r in result]

def get_prerequisites(topic_id: str):
    with driver.session() as session:
        result = session.run(
            "MATCH (pre:Topic)-[:PREREQUISITE_OF]->(t:Topic {id: $id}) "
            "RETURN pre.id as id, pre.name as name",
            id=topic_id
        )
        return [dict(r) for r in result]
