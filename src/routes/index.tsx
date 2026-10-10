import { BrowserRouter, Route, Routes } from "react-router";
import { HomePage } from "../pages";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
            </Routes>
        </BrowserRouter>
    );
}
