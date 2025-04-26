export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
    [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
    "/admin(.*)": ["admin"],
    "/student(.*)": ["student"],
    "/faculty(.*)": ["faculty"],
    "/list/faculties(.*)": ["admin", "faculty"],
    "/list/students(.*)": ["admin", "faculty"],
    "/list/courses(.*)": ["admin"],
    "/list/users(.*)": ["admin"],
    "/list/programs(.*)": ["admin"],
    "/list/timetable(.*)": ["admin"],
    "/list/batches(.*)": ["admin", "faculty"],
    "/list/attendance(.*)": ["admin", "faculty"],
};