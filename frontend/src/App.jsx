// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import { fetchTasks, createTask as apiCreateTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask } from './api';
import TaskModal from './components/TaskModal';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

const COLUMN_NAMES = {
    TO_DO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done"
};

// It's good practice to define the initial empty structure outside if it doesn't depend on props/state
const initialEmptyBoardStructure = {
  tasks: {},
  columns: {
    [COLUMN_NAMES.TO_DO]: { id: COLUMN_NAMES.TO_DO, title: 'To Do', taskIds: [] },
    [COLUMN_NAMES.IN_PROGRESS]: { id: COLUMN_NAMES.IN_PROGRESS, title: 'In Progress', taskIds: [] },
    [COLUMN_NAMES.DONE]: { id: COLUMN_NAMES.DONE, title: 'Done', taskIds: [] },
  },
  columnOrder: [COLUMN_NAMES.TO_DO, COLUMN_NAMES.IN_PROGRESS, COLUMN_NAMES.DONE],
};

function App() {
  // Initialize with a more complete empty structure to avoid undefined errors early
  const [boardData, setBoardData] = useState(initialEmptyBoardStructure);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const initializeBoard = (apiTasks = []) => { // Default apiTasks to empty array
    const tasks = {};
    if (Array.isArray(apiTasks)) {
        apiTasks.forEach(task => {
            if (task && typeof task.id !== 'undefined') {
                tasks[task.id.toString()] = { ...task, id: task.id.toString() };
            }
        });
    }


    // Start with a fresh copy of the column structure
    const columns = JSON.parse(JSON.stringify(initialEmptyBoardStructure.columns));

    if (Array.isArray(apiTasks)) {
        apiTasks.forEach(task => {
            if (task && task.status && columns[task.status]) {
                columns[task.status].taskIds.push(task.id.toString());
            } else if (task && task.status) {
                 console.warn(`Task with ID ${task.id} has status '${task.status}' not matching any defined columns.`);
            }
        });
    }
    
    setBoardData({
      tasks,
      columns,
      columnOrder: initialEmptyBoardStructure.columnOrder,
    });
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const response = await fetchTasks();
        initializeBoard(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Failed to load tasks. Please ensure the backend is running.");
        initializeBoard([]); // Initialize with empty structure on error
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const handleDragEnd = async (result) => {
    console.log("App.jsx - handleDragEnd - DRAG ENDED, result:", result); // <-- DEBUG

    const { destination, source, draggableId } = result;

    if (!destination) {
      console.log("App.jsx - handleDragEnd - No destination, drag cancelled."); // <-- DEBUG
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log("App.jsx - handleDragEnd - Dropped in the same place."); // <-- DEBUG
      return;
    }

    // It's crucial that boardData here refers to the state variable
    // Use a temporary variable for current boardData to avoid issues if state updates are batched
    const currentBoardData = boardData;
    console.log("App.jsx - handleDragEnd - Current boardData before optimistic update:", JSON.parse(JSON.stringify(currentBoardData))); // <-- DEBUG (deep copy for logging)

    const startColumn = currentBoardData.columns[source.droppableId];
    const finishColumn = currentBoardData.columns[destination.droppableId];
    const draggedTask = currentBoardData.tasks[draggableId];

    if (!startColumn || !finishColumn || !draggedTask) {
        console.error("App.jsx - handleDragEnd - Critical error: startColumn, finishColumn, or draggedTask is undefined.", { startColumn, finishColumn, draggedTask }); // <-- DEBUG
        return;
    }
    console.log("App.jsx - handleDragEnd - Start Column:", startColumn.id, "Finish Column:", finishColumn.id, "Dragged Task ID:", draggableId); // <-- DEBUG

    let newBoardDataForState;

    if (startColumn === finishColumn) { // Moving within the same column
      console.log("App.jsx - handleDragEnd - Moving within the SAME column."); // <-- DEBUG
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      newBoardDataForState = {
        ...currentBoardData,
        columns: { ...currentBoardData.columns, [newColumn.id]: newColumn },
      };
    } else { // Moving to a DIFFERENT column
      console.log("App.jsx - handleDragEnd - Moving to a DIFFERENT column."); // <-- DEBUG
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStartColumn = { ...startColumn, taskIds: startTaskIds };

      const finishTaskIds = Array.from(finishColumn.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinishColumn = { ...finishColumn, taskIds: finishTaskIds };
      
      const updatedTask = { ...draggedTask, status: finishColumn.id };

      newBoardDataForState = {
        ...currentBoardData,
        tasks: {
          ...currentBoardData.tasks,
          [draggableId]: updatedTask,
        },
        columns: {
          ...currentBoardData.columns,
          [newStartColumn.id]: newStartColumn,
          [newFinishColumn.id]: newFinishColumn,
        },
      };
    }
    console.log("App.jsx - handleDragEnd - OPTIMISTIC newBoardDataForState:", JSON.parse(JSON.stringify(newBoardDataForState))); // <-- DEBUG
    setBoardData(newBoardDataForState);

    try {
      console.log(`App.jsx - handleDragEnd - Calling API to update task ${draggableId} status to ${finishColumn.id}`); // <-- DEBUG
      // Ensure draggableId is a string when calling API if that's what the backend expects for the ID type,
      // but usually, the ID itself is what matters, not its string representation in the path.
      // The body { status: finishColumn.id } is correct.
      await apiUpdateTask(draggableId, { status: finishColumn.id });
      console.log("App.jsx - handleDragEnd - API call successful."); // <-- DEBUG
    } catch (err) {
      console.error("App.jsx - handleDragEnd - API call FAILED to update task status:", err); // <-- DEBUG
      setError("Failed to save task movement. Please try again.");
      console.log("App.jsx - handleDragEnd - Reverting UI due to API error by re-fetching tasks."); // <-- DEBUG
      // Revert to the state before optimistic update or re-fetch
      // Re-fetching is simpler for now:
      const response = await fetchTasks();
      initializeBoard(response.data); // Re-initialize with server state
    }
  };

  const openCreateModal = () => {
    console.log("App.jsx - openCreateModal called");
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    console.log("App.jsx - openEditModal called with task:", task);
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleTaskSave = async (taskDataFromModal) => {
    console.log("App.jsx - handleTaskSave called with:", taskDataFromModal);

    try {
      if (editingTask) {
        console.log("App.jsx - handleTaskSave: In 'editingTask' block (for UPDATE)");
        const updatedTaskResponse = await apiUpdateTask(editingTask.id, taskDataFromModal);
        console.log("App.jsx - handleTaskSave (UPDATE): API response:", updatedTaskResponse);

        if (updatedTaskResponse && updatedTaskResponse.data) {
          const updatedTask = { ...updatedTaskResponse.data, id: updatedTaskResponse.data.id.toString() };
          console.log("App.jsx - handleTaskSave (UPDATE): Updated task from API:", updatedTask);

          setBoardData(prevBoardData => {
            const newTasks = { ...prevBoardData.tasks, [updatedTask.id]: updatedTask };
            let newColumns = { ...prevBoardData.columns };

            if (editingTask.status !== updatedTask.status) {
              const oldColumnId = editingTask.status;
              const newColumnId = updatedTask.status;
              
              if (prevBoardData.columns[oldColumnId] && prevBoardData.columns[newColumnId]) {
                const oldColumnTaskIds = prevBoardData.columns[oldColumnId].taskIds.filter(id => id !== updatedTask.id);
                newColumns[oldColumnId] = { ...prevBoardData.columns[oldColumnId], taskIds: oldColumnTaskIds };

                const newColumnTaskIds = [...prevBoardData.columns[newColumnId].taskIds, updatedTask.id];
                newColumns[newColumnId] = { ...prevBoardData.columns[newColumnId], taskIds: newColumnTaskIds };
              } else {
                console.error("App.jsx - handleTaskSave (UPDATE): Old or new column not found for status change.");
              }
            }
            const finalBoardData = { ...prevBoardData, tasks: newTasks, columns: newColumns };
            console.log("App.jsx - handleTaskSave (UPDATE): New boardData to be set:", finalBoardData);
            return finalBoardData;
          });
        } else {
          console.error("App.jsx - handleTaskSave (UPDATE): API response is invalid.", updatedTaskResponse);
          setError("Failed to update task. Invalid response from server.");
        }

      } else { // CREATE
        console.log("App.jsx - handleTaskSave: In 'else' block (for CREATE)");
        console.log("App.jsx - handleTaskSave (CREATE): Calling apiCreateTask with:", taskDataFromModal);
        const newTaskResponse = await apiCreateTask(taskDataFromModal);
        console.log("App.jsx - handleTaskSave (CREATE): API response from apiCreateTask:", newTaskResponse);

        if (newTaskResponse && newTaskResponse.data) {
          const newTask = { ...newTaskResponse.data, id: newTaskResponse.data.id.toString() };
          console.log("App.jsx - handleTaskSave (CREATE): New task created by API:", newTask);

          setBoardData(prevBoardData => {
            if (!prevBoardData.columns[newTask.status]) {
              console.error(`App.jsx - handleTaskSave (CREATE): Column for status '${newTask.status}' not found in boardData.columns. Available columns:`, Object.keys(prevBoardData.columns));
              setError(`Error: Column status '${newTask.status}' not found. Task created but cannot be placed.`);
              // Still add to tasks so it's not lost, but won't appear in a column
              return { ...prevBoardData, tasks: { ...prevBoardData.tasks, [newTask.id]: newTask } };
            }
            const columnToUpdate = prevBoardData.columns[newTask.status];
            const newTasks = { ...prevBoardData.tasks, [newTask.id]: newTask };
            const newColumns = {
              ...prevBoardData.columns,
              [newTask.status]: {
                ...columnToUpdate,
                taskIds: [...columnToUpdate.taskIds, newTask.id],
              },
            };
            const finalBoardData = { ...prevBoardData, tasks: newTasks, columns: newColumns };
            console.log("App.jsx - handleTaskSave (CREATE): New boardData to be set:", finalBoardData);
            return finalBoardData;
          });
        } else {
          console.error("App.jsx - handleTaskSave (CREATE): API response is invalid or missing data.", newTaskResponse);
          setError("Failed to create task. Invalid response from server.");
        }
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error("App.jsx - handleTaskSave: Error during task save:", err);
      if (err.response) {
        console.error("App.jsx - handleTaskSave: Error response data:", err.response.data);
        console.error("App.jsx - handleTaskSave: Error response status:", err.response.status);
        setError(`Failed to save task: ${err.response.data?.detail || err.message} (Status: ${err.response.status})`);
      } else {
        setError(`Failed to save task: ${err.message}`);
      }
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    console.log("App.jsx - handleDeleteTask called for taskId:", taskId);
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
        const taskToDelete = boardData.tasks[taskId.toString()];
        if (!taskToDelete) {
            console.error("App.jsx - handleDeleteTask: Task not found in boardData for ID:", taskId);
            setError("Error: Task to delete not found in current board state.");
            return;
        }
        await apiDeleteTask(taskId);
        console.log("App.jsx - handleDeleteTask: API call to delete successful for taskId:", taskId);
        setBoardData(prev => {
            const newTasks = { ...prev.tasks };
            delete newTasks[taskId.toString()];
            
            const columnId = taskToDelete.status;
            const column = prev.columns[columnId];
            if (!column) {
                console.error("App.jsx - handleDeleteTask: Column not found for deleted task's status:", columnId);
                return { ...prev, tasks: newTasks }; // Remove task from tasks, but column is problematic
            }
            const newTaskIds = column.taskIds.filter(id => id !== taskId.toString());

            const finalBoardData = {
                ...prev,
                tasks: newTasks,
                columns: {
                    ...prev.columns,
                    [columnId]: { ...column, taskIds: newTaskIds }
                }
            };
            console.log("App.jsx - handleDeleteTask: New boardData to be set:", finalBoardData);
            return finalBoardData;
        });
    } catch (err) {
      console.error("App.jsx - handleDeleteTask: Error during task deletion:", err);
      if (err.response) {
        console.error("App.jsx - handleDeleteTask: Error response data:", err.response.data);
        setError(`Failed to delete task: ${err.response.data?.detail || err.message}`);
      } else {
        setError(`Failed to delete task: ${err.message}`);
      }
    }
  };

  if (loading) return <div className="p-4 text-center">Loading board...</div>;
  
  return (
    <div className="min-h-screen bg-blue-100 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Task Board</h1>
        <button
          onClick={openCreateModal}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          New Task
        </button>
      </div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      {boardData.columnOrder && boardData.columnOrder.length > 0 && Object.keys(boardData.columns).length > 0 ? (
          <Board
            boardData={boardData}
            onDragEnd={handleDragEnd}
            onEditTask={openEditModal}
            onDeleteTask={handleDeleteTask}
          />
      ) : (
        !loading && <div className="text-center text-gray-500">Board is empty or cannot be displayed.</div>
      )}

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
          onSave={handleTaskSave}
          task={editingTask}
          columnNames={COLUMN_NAMES}
        />
      )}
    </div>
  );
}
export default App;