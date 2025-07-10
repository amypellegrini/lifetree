import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { collection, getDocs, where, query } from "firebase/firestore";
import { z } from "zod";
import { db } from "./firebase.js";
import { addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

const userId = "Amy";

async function createGoal(
  userId: string,
  goal: string,
  initialTaskIds: string[] = []
) {
  const docRef = await addDoc(collection(db, "goals"), {
    goal: goal,
    userId: userId,
    status: "Not Started",
    initialTaskIds: initialTaskIds,
    createdAt: new Date(),
  });

  return docRef.id;
}

async function createTask(
  userId: string,
  goalId: string,
  task: string,
  prevTaskIds: string[] = [],
  nextTaskIds: string[] = []
) {
  const docRef = await addDoc(collection(db, "tasks"), {
    task: task,
    prevTaskIds: prevTaskIds,
    nextTaskIds: nextTaskIds,
    goalId: goalId,
    userId: userId,
    status: "Not Started",
    createdAt: new Date(),
  });

  return docRef.id;
}

async function getTasksByGoalId(goalId: string) {
  const tasks = await getDocs(
    query(collection(db, "tasks"), where("goalId", "==", goalId))
  );
  return tasks.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function getAllGoals(userId: string) {
  const goals = await getDocs(
    query(collection(db, "goals"), where("userId", "==", userId))
  );
  return goals.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function updateGoalInitialTasks(
  goalId: string,
  initialTaskIds: string[]
) {
  await updateDoc(doc(db, "goals", goalId), {
    initialTaskIds: initialTaskIds,
  });
}

async function deleteTask(taskId: string) {
  await deleteDoc(doc(db, "tasks", taskId));
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
    initialTaskIds: z
      .array(z.string())
      .describe("Initial task IDs to associate with this goal")
      .optional(),
  },
  async ({ goal, initialTaskIds = [] }) => {
    const goalId = await createGoal(userId, goal, initialTaskIds);
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
  "Create a new Life Tree task for a given goal linked by its goal ID",
  {
    goalId: z.string().describe("The goal ID to create the task for"),
    task: z.string().describe("The task to create"),
    prevTaskIds: z
      .array(z.string())
      .describe("The previous task IDs")
      .optional(),
    nextTaskIds: z.array(z.string()).describe("The next task IDs").optional(),
  },
  async ({ goalId, task, prevTaskIds = [], nextTaskIds = [] }) => {
    const taskId = await createTask(
      userId,
      goalId,
      task,
      prevTaskIds,
      nextTaskIds
    );

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

server.tool(
  "update-task",
  "Update a task",
  {
    taskId: z.string().describe("The task ID to update"),
    task: z.string().describe("The task to update"),
    prevTaskIds: z
      .array(z.string())
      .describe("The previous task IDs")
      .optional(),
    nextTaskIds: z.array(z.string()).describe("The next task IDs").optional(),
  },
  async ({ taskId, task, prevTaskIds = [], nextTaskIds = [] }) => {
    await updateDoc(doc(db, "tasks", taskId), {
      task,
      prevTaskIds,
      nextTaskIds,
    });

    return {
      content: [
        {
          type: "text",
          text: `Task updated successfully with ID: ${taskId}`,
        },
      ],
    };
  }
);

server.tool(
  "get-tasks-by-goal-id",
  "Get all tasks for a given goal linked by its goal ID",
  {
    goalId: z.string().describe("The goal ID to get the tasks for"),
  },
  async ({ goalId }) => {
    const tasks = await getTasksByGoalId(goalId);
    return {
      content: [
        {
          type: "text",
          text: `Tasks: ${JSON.stringify(tasks)}`,
        },
      ],
    };
  }
);

server.tool(
  "update-goal-status",
  "Update the status of a goal",
  {
    goalId: z.string().describe("The goal ID to update"),
    status: z
      .enum(["Not Started", "In Progress", "Done"])
      .describe("The new status for the goal"),
  },
  async ({ goalId, status }) => {
    await updateDoc(doc(db, "goals", goalId), {
      status,
    });

    return {
      content: [
        {
          type: "text",
          text: `Goal status updated successfully to: ${status}`,
        },
      ],
    };
  }
);

server.tool(
  "update-task-status",
  "Update the status of a task",
  {
    taskId: z.string().describe("The task ID to update"),
    status: z
      .enum(["Not Started", "In Progress", "Done"])
      .describe("The new status for the task"),
  },
  async ({ taskId, status }) => {
    await updateDoc(doc(db, "tasks", taskId), {
      status,
    });

    return {
      content: [
        {
          type: "text",
          text: `Task status updated successfully to: ${status}`,
        },
      ],
    };
  }
);

server.tool(
  "update-goal-initial-tasks",
  "Update the initial tasks for an existing goal",
  {
    goalId: z.string().describe("The goal ID to update"),
    initialTaskIds: z
      .array(z.string())
      .describe("The initial task IDs to set for this goal"),
  },
  async ({ goalId, initialTaskIds }) => {
    await updateGoalInitialTasks(goalId, initialTaskIds);
    return {
      content: [
        {
          type: "text",
          text: `Goal initial tasks updated successfully`,
        },
      ],
    };
  }
);

server.tool(
  "delete-task",
  "Delete a task by its ID",
  {
    taskId: z.string().describe("The task ID to delete"),
  },
  async ({ taskId }) => {
    await deleteTask(taskId);
    return {
      content: [
        {
          type: "text",
          text: `Task deleted successfully with ID: ${taskId}`,
        },
      ],
    };
  }
);

async function main() {
  await server.connect(new StdioServerTransport());
}

main();
