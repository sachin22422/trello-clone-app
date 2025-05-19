// frontend/src/components/Column.jsx
import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

function Column({ column, tasks, onEditTask, onDeleteTask }) {
  return (
    <div className="bg-gray-100 rounded-lg p-3 w-80 flex-shrink-0 shadow-md">
      <h3 className="font-semibold text-lg mb-3 px-1 text-gray-700">{column.title} ({tasks.length})</h3>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] transition-colors duration-200 ease-in-out rounded-md p-1 ${
              snapshot.isDraggingOver ? 'bg-blue-200' : 'bg-gray-100'
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
export default Column;