import { BrowserRouter, Link, Route, Routes } from "react-router";
import HomePage from "../pages/HomePage";
import ProcessTaskPage from "../pages/ProcessTaskPage";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tasks/:id/process" element={<ProcessTaskPage />} />
                <Route
                    path="*"
                    element={
                        <main className="p-8">
                            <h1 className="text-xl font-bold">Page not found</h1>
                            <Link to="/" className="mt-4 inline-block text-indigo-600">
                                Back to tasks
                            </Link>
                        </main>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
