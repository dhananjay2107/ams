'use client'
import { useState } from "react";
import {
    DndContext,
    DragEndEvent,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type Course = {
    id: string;
    name: string;
};

type GridCell = {
    day: string;
    period: number;
    course: Course | null;
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [1, 2, 3, 4, 5, 6];

const courses: Course[] = [
    { id: "c1", name: "Math" },
    { id: "c2", name: "Physics" },
    { id: "c3", name: "Chemistry" },
    { id: "c4", name: "Biology" },
    { id: "c5", name: "Botany" },
    { id: "c6", name: "Zoology" },
    { id: "c7", name: "Biology" },
];


const TimetableTrial = () => {

    const [grid, setGrid] = useState<GridCell[][]>(
        days.map((day) =>
            periods.map((period) => ({ day, period, course: null }))
        )
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !over.data.current) return;

        const draggedCourse = courses.find((course) => course.id === active.id);
        if (!draggedCourse) return;

        const { day, period } = over.data.current as { day: string; period: number };

        setGrid((prevGrid) =>
            prevGrid.map((row) =>
                row.map((cell) =>
                    cell.day === day && cell.period === Number(period)
                        ? { ...cell, course: draggedCourse } // Assign course to the cell
                        : cell
                )
            )
        );
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-8 p-4 overflow-visible">
                {/* Available Courses Sidebar */}
                <div className="w-1/4 space-y-4 overflow-visible">
                    <h2 className="text-xl font-bold">Available Courses</h2>
                    {courses.map((course) => (
                        <DraggableCourse key={course.id} course={course} />
                    ))}
                </div>

                {/* Timetable Grid */}
                <div className="grid grid-cols-7 gap-2 border p-4">
                    {/* Header Row */}
                    <div className="bg-gray-200 p-2 font-bold text-center">Days/Periods</div>
                    {periods.map((period) => (
                        <div key={period} className="bg-gray-200 p-2 font-bold text-center">
                            Period {period}
                        </div>
                    ))}

                    {/* Timetable Rows */}
                    {grid.map((row, rowIndex) => (
                        <div key={`row-${rowIndex}`} className="contents">
                            {/* Day Header */}
                            <div key={`day-${days[rowIndex]}`} className="bg-gray-100 p-2 font-bold text-center">
                                {days[rowIndex]}
                            </div>

                            {/* Period Cells */}
                            {row.map((cell) => (
                                <DroppableCell key={`cell-${cell.day}-${cell.period}`} cell={cell} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </DndContext>
    )
}
const DraggableCourse = ({ course }: { course: Course }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: course.id,
    });

    const style = {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="cursor-grab select-none rounded-lg bg-blue-500 p-2 text-white shadow-md"
        >
            {course.name}
        </div>
    );
};

const DroppableCell = ({ cell }: { cell: GridCell }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `${cell.day}-${cell.period}`,
        data: { day: cell.day, period: cell.period },
    });

    return (
        <div
            ref={setNodeRef}
            className={`h-16 w-24 border flex items-center justify-center text-sm transition-all 
        ${isOver ? "bg-green-200" : "bg-white"}`}
        >
            {cell.course ? (
                <div className="rounded-lg bg-blue-400 p-2 text-white">
                    {cell.course.name}
                </div>
            ) : (
                <span className="text-gray-400">Drop Here</span>
            )}
        </div>
    );
};

export default TimetableTrial