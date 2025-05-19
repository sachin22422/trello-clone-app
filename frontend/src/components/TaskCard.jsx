// frontend/src/components/TaskCard.jsx
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function TaskCard({ task, index, onEdit, onDelete }) {
  if (!task) return null; // Prevent rendering if task is undefined (e.g. during state updates)

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-3 mb-2 rounded-md shadow-sm border border-gray-200 hover:shadow-lg transition-shadow ${
            snapshot.isDragging ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-800 break-words w-[calc(100%-40px)]">{task.title}</h4>
            <div className="flex space-x-1">
              <button onClick={onEdit} className="text-gray-500 hover:text-blue-600 p-1">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button onClick={onDelete} className="text-gray-500 hover:text-red-600 p-1">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1 break-words">{task.description}</p>
          )}
        </div>
      )}
    </Draggable>
  );
}
export default TaskCard;