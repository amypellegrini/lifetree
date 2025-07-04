import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { collection, getDocs, where, query } from "firebase/firestore";
import { z } from "zod";
import { db } from "./firebase.js";
import { addDoc } from "firebase/firestore";

const userId = "Amy";

async function createGoal(userId: string, goal: string) {
  const docRef = await addDoc(collection(db, "goals"), {
    goal: goal,
    userId: userId,
    createdAt: new Date(),
  });

  return docRef.id;
}

async function createTask(userId: string, goalId: string, task: string) {
  const docRef = await addDoc(collection(db, "tasks"), {
    task: task,
    goalId: goalId,
    userId: userId,
    createdAt: new Date(),
  });

  return docRef.id;
}

async function getAllGoals(userId: string) {
  const goals = await getDocs(
    query(collection(db, "goals"), where("userId", "==", userId))
  );
  return goals.docs.map((doc) => doc.data());
}

const server = new McpServer({
  name: "life-tree-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "create-goal",
  "Create a new Life Tree goal",
  {
    goal: z.string().describe("The goal to achieve"),
  },
  async ({ goal }) => {
    const goalId = await createGoal(userId, goal);
    return {
      content: [
        {
          type: "text",
          text: `Goal created successfully with ID: ${goalId}`,
        },
      ],
    };
  }
);

server.tool(
  "get-all-goals",
  "Get all Life Tree goals for a user",
  {},
  async ({}) => {
    const goals = await getAllGoals(userId);
    return {
      content: [
        {
          type: "text",
          text: `Goals: ${JSON.stringify(goals)}`,
        },
      ],
    };
  }
);

server.tool(
  "create-task",
  "Create a new Life Tree task",
  {
    goalId: z.string().describe("The goal ID to create the task for"),
    task: z.string().describe("The task to create"),
  },
  async ({ goalId, task }) => {
    const taskId = await createTask(userId, goalId, task);

    return {
      content: [
        {
          type: "text",
          text: `Task created successfully with ID: ${taskId}`,
        },
      ],
    };
  }
);

async function main() {
  await server.connect(new StdioServerTransport());
}

main();
