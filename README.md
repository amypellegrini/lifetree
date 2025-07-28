# Lifetree MCP server/client

The Lifetree MCP framework provides tools for LLMs supporting MCP to aid humans with goal keeping and task planning.

## Local environment setup

### Install dependencies

```
npm install
npm install -g firebase-tools
```

### Setup environment variables

| Variable          | Description                                     |
| ----------------- | ----------------------------------------------- |
| MCP_SERVER_SCRIPT | Path to the MCP server script (.js or .py file) |
| ANTHROPIC_API_KEY | Your Anthropic API key for Claude access        |

### Run firebase emulators

```
firebase emulators:start
```

## Setup MCP server with Claude app

For using the Lifetree MCP server with the Anthropic Claude app you need to build the server and configure the Claude app:

### 1. Build the server

```
cd server
npm install
npm run build
```

### 2. Map Lifetree MCP server build file in Claude config

```
TODO
```

### 3. Setup project with custom instructions

For getting best results with the Lifetree MCP server, Claude needs some additional instructions. I recommend setting up a project in the Claude app with the following custom instructions:

```
When asked to represent the goals as a diagram, use Mermaid diagrams by default. Do not use any other kind of diagram (HTML, React, etc), only mermaid diagrams. The status of each goal/task should be color coded and the text should be black to provide enough contrast with the background. Color codes are reserved for status only (WIP, Done, Not started), initial tasks should not be color coded. The status should also appear in parenthesis next to the task or goal description. When connecting the tasks with arrows, make sure the arrow connections represent the previous and next task connections. When connecting the goal with tasks, only draw arrows linking to the initial tasks. Do not draw arrows of any kind (dotted, dash, etc) from the goal to all the tasks, only draw arrows from the goal to the initial tasks, and then connecting the tasks in their respective sequence.
```
