import { createBrowserRouter } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout"
import ProtectedRoute from "./ProtectedRoute"

/* Public */

import LandingPage from "../pages/public/LandingPage"
import ExplorePage from "../pages/public/ExplorePage"
import ExploreGamesPage from "../pages/public/ExploreGamesPage"
import LoginPage from "../pages/public/LoginPage"
import RegisterPage from "../pages/public/RegisterPage"
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage"
import NotFoundPage from "../pages/public/NotFoundPage"

/* Student */

import JoinGamePage from "../pages/student/JoinGamePage"
import EnterPlayerPage from "../pages/student/EnterPlayerPage"
import GameLobbyPage from "../pages/student/GameLobbyPage"
import ResultPage from "../pages/student/ResultPage"
import LeaderboardPage from "../pages/student/LeaderboardPage"
import DashboardStudentPage from "../pages/student/DashboardStudentPage"

/* Teacher */

import DashboardTeacherPage from "../pages/teacher/DashboardTeacherPage"
import ClassPage from "../pages/teacher/ClassPage"
import MyProjectsPage from "../pages/teacher/create-game/MyProjectsPage"
import AnalyticsClassPage from "../pages/teacher/analytics/AnalyticsClassPage"

import ChooseLevelPage from "../pages/teacher/create-game/ChooseLevelPage"
import ChooseTemplatePage from "../pages/teacher/create-game/ChooseTemplatePage"
import CreateGamePage from "../pages/teacher/create-game/CreateGamePage"
import AddQuestionsPage from "../pages/teacher/create-game/AddQuestionsPage"
import PreviewGamePage from "../pages/teacher/create-game/PreviewGamePage"

/* Profile */

import ProfilePage from "../pages/profile/ProfilePage"
import EditProfilePage from "../pages/profile/EditProfilePage"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [

            /* PUBLIC */

            { index: true, element: <LandingPage /> },
            { path: "explore", element: <ExplorePage /> },
            { path: "explore/games", element: <ExploreGamesPage /> },

            { path: "login", element: <LoginPage /> },
            { path: "register", element: <RegisterPage /> },
            { path: "forgot-password", element: <ForgotPasswordPage /> },

            /* STUDENT */

            { path: "join", element: <JoinGamePage /> },
            { path: "join/player", element: <EnterPlayerPage /> },
            { path: "game/lobby", element: <GameLobbyPage /> },
            { path: "game/result", element: <ResultPage /> },
            { path: "game/leaderboard", element: <LeaderboardPage /> },

            {
                path: "student/dashboard",
                element: (
                    <ProtectedRoute roles={["student"]}>
                        <DashboardStudentPage />
                    </ProtectedRoute>
                )
            },

            /* TEACHER */

            {
                path: "teacher/dashboard",
                element: (
                    <ProtectedRoute roles={["teacher"]}>
                        <DashboardTeacherPage />
                    </ProtectedRoute>
                )
            },

            {
                path: "teacher/projects",
                element: (
                    <ProtectedRoute roles={["teacher"]}>
                        <MyProjectsPage />
                    </ProtectedRoute>
                )
            },

            {
                path: "teacher/analytics",
                element: (
                    <ProtectedRoute roles={["teacher"]}>
                        <AnalyticsClassPage />
                    </ProtectedRoute>
                )
            },

            {
                path: "teacher/classes",
                element: (
                    <ProtectedRoute roles={["teacher"]}>
                        <ClassPage />
                    </ProtectedRoute>
                )
            },

            /* GAME CREATOR */

            {
                path: "game/choose-level",
                element: <ChooseLevelPage />
            },

            {
                path: "game/templates",
                element: <ChooseTemplatePage />
            },

            {
                path: "game/create",
                element: <CreateGamePage />
            },

            {
                path: "game/questions",
                element: <AddQuestionsPage />
            },

            {
                path: "game/preview",
                element: <PreviewGamePage />
            },

            /* PROFILE */

            {
                path: "profile",
                element: (
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                )
            },

            {
                path: "profile/edit",
                element: (
                    <ProtectedRoute>
                        <EditProfilePage />
                    </ProtectedRoute>
                )
            },

            /* 404 */

            {
                path: "*",
                element: <NotFoundPage />
            }

        ]
    }
])