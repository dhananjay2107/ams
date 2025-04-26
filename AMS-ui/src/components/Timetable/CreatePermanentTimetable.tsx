'use client'
import { Batch, Course } from '@/interfaces/Interfaces';
import { getBatches } from '@/services/api/batch';
import { getCoursesWithAssignments } from '@/services/api/course';
import { saveTimetable } from '@/services/api/timetable';
import {
    DndContext,
    DragEndEvent,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button, Input, Select, SelectItem } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Loader from '../Loader/Loader';

type GridCell = { day: string; period: number; course: any | null };

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CreatePermanentTimetable = () => {

    const [grid, setGrid] = useState<GridCell[][]>([]);
    const [batches, setBatches] = useState<Batch[]>([])
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
    const [numPeriods, setNumPeriods] = useState<number | null>(null);
    const [courses, setCourses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [semester, setSemester] = useState<string>("")
    const [name, setName] = useState<string>("")

    const router = useRouter()

    useEffect(() => {
        getBatches().then(setBatches)
    }, [])

    useEffect(() => {
        if (selectedBatch?._id) {
            setCourses([]); // Clear previous courses
            getCoursesWithAssignments(selectedBatch.semester, selectedBatch._id).then(setCourses);
        }
    }, [selectedBatch])

    useEffect(() => {
        if (numPeriods && selectedBatch) {
            setGrid(
                days.map((day) =>
                    Array.from({ length: numPeriods }).map((_, index) => ({
                        day,
                        period: index + 1,
                        course: null,
                    }))
                )
            );
        }
    }, [numPeriods, selectedBatch]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !over.data.current) return;

        const courseId = active.id as string;

        const draggedCourse = courses.find((course) => course._id === courseId);
        if (!draggedCourse) return;

        const { faculty_id, faculty_name } = draggedCourse;

        const { day, period } = over.data.current as { day: string; period: number };

        setGrid((prevGrid) =>
            prevGrid.map((row) =>
                row.map((cell) =>
                    cell.day === day && cell.period === Number(period)
                        ? { ...cell, course: draggedCourse, faculty_id, faculty_name }
                        : cell
                )
            )
        );
    };

    const handleRemoveCourse = (day: string, period: number) => {
        setGrid((prevGrid) =>
            prevGrid.map((row) =>
                row.map((cell) =>
                    cell.day === day && cell.period === period
                        ? { ...cell, course: null, faculty_id: null, faculty_name: null } // ✅ Clear Course
                        : cell
                )
            )
        );
    };

    const handleSave = async () => {
        if (!selectedBatch || !numPeriods) return;
        setIsLoading(true)

        const timetableData = {
            name: name,
            batch_id: selectedBatch._id,
            semester: semester,
            days: grid.reduce((acc, row) => {
                acc[row[0].day] = row.map((cell) => ({
                    period: cell.period,
                    course_id: cell.course?._id ?? null,
                    faculty_id: cell.course?.faculty_id ?? null
                }));
                return acc;
            }, {} as Record<string, { period: number; course_id: string | null }[]>),
        };
        try {
            const response = await saveTimetable(timetableData);
            if (response) {
                toast.success(response, {
                    autoClose: 2000,
                    position: "top-right"
                })
                router.push("/admin/timetable/permanent-timetable")
            }
        }
        catch (error: any) {
            toast.error(error.message, {
                autoClose: 2000,
                position: "top-right"
            })
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex flex-col gap-4'>
            <Input
                className='max-w-xs'
                type='text'
                label='Name'
                labelPlacement='outside'
                placeholder='Enter Timetable Name'
                isRequired
                variant='bordered'
                onChange={(e) => setName(e.target.value)}
            />
            <div className='flex gap-2'>
                <Select
                    className="max-w-xs flex items-center"
                    label="Batch"
                    items={batches}
                    labelPlacement='outside'
                    placeholder="Select Batch"
                    variant='bordered'
                    isRequired
                    onChange={(e) => {
                        const batch = batches.find((b) => b._id === e.target.value);
                        setSelectedBatch(batch || null);
                    }}
                >
                    {(batch) => (
                        <SelectItem key={batch._id}>{batch.batch_name}</SelectItem>
                    )}
                </Select>
                <Input
                    placeholder='Select semester'
                    variant='bordered'
                    className='max-w-xs'
                    label='Semester'
                    labelPlacement='outside'
                    isRequired
                    type='number'
                    onChange={(e) => setSemester(e.target.value)}
                />
            </div>


            {selectedBatch && (
                <Input
                    type='number'
                    label="Number of periods"
                    labelPlacement='outside'
                    className='max-w-xs'
                    placeholder='Enter number of periods'
                    isRequired
                    min={1}
                    max={10}
                    onChange={(e) => setNumPeriods(Number(e.target.value))}
                />
            )}

            {numPeriods && (
                <DndContext onDragEnd={handleDragEnd}>
                    <div className="flex gap-8 p-4 w-full">
                        {/* Course List */}
                        <div className="w-1/5 space-y-4">
                            <h2 className="text-lg font-bold">Available Courses</h2>
                            {courses.map((course, index) => (
                                <DraggableCourse key={course._id || `course-${index}`} course={course} />
                            ))}
                        </div>

                        {/* Timetable Grid */}
                        <div className='grid gap-2 border p-4 items-center w-4/5' style={{ gridTemplateColumns: `repeat(${numPeriods + 1}, minmax(0, 1fr))` }}>
                            {/* Header Row */}
                            <div className="bg-gray-200 p-2 font-bold text-center">Days/Periods</div>
                            {Array.from({ length: numPeriods }).map((_, index) => (
                                <div key={index} className="bg-gray-200 p-2 font-bold text-center">
                                    Period {index + 1}
                                </div>
                            ))}

                            {/* Timetable Rows */}
                            {grid.map((row, rowIndex) => (
                                <div key={`row-${rowIndex}`} className="contents">
                                    <div className="bg-gray-100 p-2 font-bold text-center">{days[rowIndex]}</div>
                                    {row.map((cell) => (
                                        <DroppableCell key={`cell-${cell.day}-${cell.period}`} cell={cell} onRemoveCourse={handleRemoveCourse} />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </DndContext>
            )}
            <div className='flex justify-start'>
                <Button variant='light' onPress={(e) => router.push("/admin/timetable/permanent-timetable")}>Cancel</Button>
                <Button variant='solid' color='primary' onPress={(e) => handleSave()}>Save</Button>
            </div>
            {isLoading && (
                <div className="absolute w-full h-full bg-white bg-opacity-50 flex justify-center items-center">
                    <Loader />
                </div>
            )}
        </div>
    )
}

const DraggableCourse = ({ course }: { course: Course }) => {
    const id = course._id ?? `temp-${course.course_name}`;
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { course }
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
            {course.course_name}
        </div>
    );
};

// Droppable Timetable Cell Component
const DroppableCell = ({ cell, onRemoveCourse }: { cell: GridCell, onRemoveCourse: (day: string, period: number) => void }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `${cell.day}-${cell.period}`,
        data: { day: cell.day, period: cell.period }
    });
    return (
        <div
            ref={setNodeRef}
            className={`border flex items-center cursor-pointer justify-center text-sm transition-all 
            ${isOver ? "bg-green-200" : "bg-white"}`}
            onClick={() => onRemoveCourse(cell.day, cell.period)}
        >
            {cell.course ? (
                <div className="rounded-lg bg-blue-400 p-2 text-white">
                    <div className='text-sm font-bold'>{cell.course.course_name}</div>
                    <div className="text-xs text-gray-200">({cell.course.faculty_name ?? "No Faculty"})</div>

                </div>
            ) : (
                <span className="text-gray-400">Drop Here</span>
            )}
        </div>
    );
};

export default CreatePermanentTimetable