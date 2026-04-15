import { BrowserRouter, Routes, Route } from "react-router-dom"

import ProtectedRoute from "./ProtectedRoute"
import MainLayout from "../components/layout/MainLayout"

/* PUBLIC */

import LandingPage from "../pages/public/LandingPage"
import LoginPage from "../pages/public/LoginPage"
import RegisterPage from "../pages/public/RegisterPage"
import ExplorePage from "../pages/public/ExplorePage"
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage"
import NotFoundPage from "../pages/public/NotFoundPage"

/* PROFILE */

import ProfilePage from "../pages/profile/ProfilePage"
import EditProfilePage from "../pages/profile/EditProfilePage"

/* STUDENT */

import StudentDashboard from "../pages/student/StudentDashboard"
import JoinGamePage from "../pages/student/JoinGamePage"
import PlayGamePage from "../pages/student/PlayGamePage"
import ResultPage from "../pages/student/ResultPage"
import AnalyticsStudentPage from "../pages/student/AnalyticsStudentPage"
import LeaderboardPage from "../pages/student/LeaderboardPage"
import EnterPlayerPage from "../pages/student/EnterPlayerPage"
import GameLobbyPage from "../pages/student/GameLobbyPage"
import GameSessionPage from "../pages/student/GameSessionPage"

/* TEACHER */

import TeacherDashboard from "../pages/teacher/TeacherDashboard"
import ClassPage from "../pages/teacher/ClassPage"

import MyProjectsPage from "../pages/teacher/create-game/MyProjectsPage"
import ChooseLevelPage from "../pages/teacher/create-game/ChooseLevelPage"
import ChooseTemplatePage from "../pages/teacher/create-game/ChooseTemplatePage"
import GameBuilderPage from "../pages/teacher/create-game/GameBuilderPage"
import AddQuestionsPage from "../pages/teacher/create-game/AddQuestionsPage"
import EditGamePage from "../pages/teacher/create-game/EditGamePage"
import PreviewGamePage from "../pages/teacher/create-game/PreviewGamePage"

import AnalyticsClassPage from "../pages/teacher/analytics/AnalyticsClassPage"

/* ADMIN */

import AdminDashboard from "../pages/admin/AdminDashboard"
import UserManagementPage from "../pages/admin/UserManagementPage"
import SystemLogsPage from "../pages/admin/SystemLogsPage"

export default function Router() {
  return (
    <BrowserRouter>

      <Routes>

        <Route element={<MainLayout />}>

          {/* ================= PUBLIC ================= */}

          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ================= PROFILE ================= */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ================= STUDENT ================= */}

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/analytics"
            element={
              <ProtectedRoute role="STUDENT">
                <AnalyticsStudentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/join"
            element={
              <ProtectedRoute>
                <JoinGamePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/play/:gameId"
            element={
              <ProtectedRoute>
                <PlayGamePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/result/:sessionId"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard/:gameId"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/game/enter"
            element={
              <ProtectedRoute>
                <EnterPlayerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/game/lobby/:sessionId"
            element={
              <ProtectedRoute>
                <GameLobbyPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/game/session/:sessionId"
            element={
              <ProtectedRoute>
                <GameSessionPage />
              </ProtectedRoute>
            }
          />

          {/* ================= TEACHER ================= */}

          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute role="TEACHER">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/class"
            element={
              <ProtectedRoute role="TEACHER">
                <ClassPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/projects"
            element={
              <ProtectedRoute role="TEACHER">
                <MyProjectsPage />
              </ProtectedRoute>
            }
          />

          {/* CREATE GAME FLOW */}

          <Route
            path="/teacher/create/level"
            element={
              <ProtectedRoute role="TEACHER">
                <ChooseLevelPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/create/template"
            element={
              <ProtectedRoute role="TEACHER">
                <ChooseTemplatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/create/builder"
            element={
              <ProtectedRoute role="TEACHER">
                <GameBuilderPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/create/questions"
            element={
              <ProtectedRoute role="TEACHER">
                <AddQuestionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/game/edit/:gameId"
            element={
              <ProtectedRoute role="TEACHER">
                <EditGamePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/game/preview/:gameId"
            element={
              <ProtectedRoute role="TEACHER">
                <PreviewGamePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/analytics"
            element={
              <ProtectedRoute role="TEACHER">
                <AnalyticsClassPage />
              </ProtectedRoute>
            }
          />

          {/* ================= ADMIN ================= */}

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute role="ADMIN">
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute role="ADMIN">
                <SystemLogsPage />
              </ProtectedRoute>
            }
          />

          {/* ================= 404 ================= */}

          <Route path="*" element={<NotFoundPage />} />

        </Route>

      </Routes>

    </BrowserRouter>
  )
}