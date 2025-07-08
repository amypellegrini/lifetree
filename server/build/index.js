import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { collection, getDocs, where, query } from "firebase/firestore";
import { z } from "zod";
import { db } from "./firebase.js";
import { addDoc, updateDoc, doc } from "firebase/firestore";
const userId = "Amy";
async function createGoal(userId, goal) {
    const docRef = await addDoc(collection(db, "goals"), {
        goal: goal,
        userId: userId,
        createdAt: new Date(),
    });
    return docRef.id;
}
async function createTask(userId, goalId, task, prevTaskId = "", nextTaskId = "") {
    const docRef = await addDoc(collection(db, "tasks"), {
        task: task,
        prevTaskId: prevTaskId,
        nextTaskId: nextTaskId,
        goalId: goalId,
        userId: userId,
        createdAt: new Date(),
    });
    return docRef.id;
}
async function getTasksByGoalId(goalId) {
    const tasks = await getDocs(query(collection(db, "tasks"), where("goalId", "==", goalId)));
    return tasks.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}
async function getAllGoals(userId) {
    const goals = await getDocs(query(collection(db, "goals"), where("userId", "==", userId)));
    return goals.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}
const server = new McpServer({
    name: "life-tree-mcp",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
server.tool("create-goal", "Create a new Life Tree goal", {
    goal: z.string().describe("The goal to achieve"),
}, async ({ goal }) => {
    const goalId = await createGoal(userId, goal);
    return {
        content: [
            {
                type: "text",
                text: `Goal created successfully with ID: ${goalId}`,
            },
        ],
    };
});
server.tool("get-all-goals", "Get all Life Tree goals for a user", {}, async ({}) => {
    const goals = await getAllGoals(userId);
    return {
        content: [
            {
                type: "text",
                text: `Goals: ${JSON.stringify(goals)}`,
            },
        ],
    };
});
server.tool("create-task", "Create a new Life Tree task for a given goal linked by its goal ID", {
    goalId: z.string().describe("The goal ID to create the task for"),
    task: z.string().describe("The task to create"),
    prevTaskId: z.string().describe("The previous task ID").optional(),
    nextTaskId: z.string().describe("The next task ID").optional(),
}, async ({ goalId, task, prevTaskId, nextTaskId }) => {
    const taskId = await createTask(userId, goalId, task, prevTaskId, nextTaskId);
    return {
        content: [
            {
                type: "text",
                text: `Task created successfully with ID: ${taskId}`,
            },
        ],
    };
});
server.tool("update-task", "Update a task", {
    taskId: z.string().describe("The task ID to updat"),
    task: z.string().describe("The task to update"),
    prevTaskId: z.string().describe("The previous task ID").optional(),
    nextTaskId: z.string().describe("The next task ID").optional(),
}, async ({ taskId, task, prevTaskId = "", nextTaskId = "" }) => {
    await updateDoc(doc(db, "tasks", taskId), {
        task,
        prevTaskId,
        nextTaskId,
    });
    return {
        content: [
            {
                type: "text",
                text: `Task updated successfully with ID: ${taskId}`,
            },
        ],
    };
});
server.tool("get-tasks-by-goal-id", "Get all tasks for a given goal linked by its goal ID", {
    goalId: z.string().describe("The goal ID to get the tasks for"),
}, async ({ goalId }) => {
    const tasks = await getTasksByGoalId(goalId);
    return {
        content: [
            {
                type: "text",
                text: `Tasks: ${JSON.stringify(tasks)}`,
            },
        ],
    };
});
async function main() {
    await server.connect(new StdioServerTransport());
}
main();
