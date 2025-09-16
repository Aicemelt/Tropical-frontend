import {createBrowserRouter} from "react-router-dom";
import RootLayout from "../layouts/RootLayout.jsx";
import CalendarPage from "../pages/CalendarPage.jsx";
import TodoPage from "../pages/TodoPage.jsx";
import BucketPage from "../pages/BucketPage.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <div>에러페이지입니다?</div>,
        /*loader: userDataLoader, // 로더 생성 후 연결
        id: 'user-token-data',*/ // 토큰
        children: [
            {
                index: true,
                element: <CalendarPage />
            },
            {
                path: 'todo',
                element: <TodoPage />
            },
            {
                path: 'bucket',
                element: <BucketPage />
            }
        ]
    }
]);

export default router