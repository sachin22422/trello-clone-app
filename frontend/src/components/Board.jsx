// frontend/src/components/Board.jsx
import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column';

function Board({ boardData, onDragEnd, onEditTask, onDeleteTask }) {
  if (!boardData || !boardData.columnOrder || !boardData.columns || !boardData.tasks) {
    // This can happen if boardData is not fully initialized yet
    return <div className="text-center p-4">Loading board components...</div>;
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 overflow-x-auto p-2">
        {boardData.columnOrder.map(columnId => {
          const column = boardData.columns[columnId];
          if (!column) {
              console.warn(`Column with ID ${columnId} not found in boardData.columns`);
              return null; // Or some placeholder
          }
          const tasksInColumn = column.taskIds.map(taskId => boardData.tasks[taskId]).filter(task => task); // Filter out undefined tasks

          return (
            <Column 
              key={column.id} 
              column={column} 
              tasks={tasksInColumn}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
export default Board;