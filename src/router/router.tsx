import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";

/* PUBLIC PAGES */
import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import ExplorePage from "../pages/public/ExplorePage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";
import NotFoundPage from "../pages/public/NotFoundPage";

/* PROFILE PAGES */
import ProfilePage from "../pages/profile/ProfilePage";
import EditProfilePage from "../pages/profile/EditProfilePage";

/* STUDENT PAGES */
import StudentDashboard from "../pages/student/StudentDashboard";
import JoinGamePage from "../pages/student/JoinGamePage";
import EnterPlayerPage from "../pages/student/EnterPlayerPage";
import GameLobbyPage from "../pages/student/GameLobbyPage";
import GameSessionPage from "../pages/student/GameSessionPage";
import PlayGamePage from "../pages/student/PlayGamePage";
import ResultPage from "../pages/student/ResultPage";
import AnalyticsStudentPage from "../pages/student/AnalyticsStudentPage";
import LeaderboardPage from "../pages/student/LeaderboardPage";

/* TEACHER PAGES */
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import MyProjectsPage from "../pages/teacher/create-game/MyProjectsPage";
import ChooseLevelPage from "../pages/teacher/create-game/ChooseLevelPage";
import ChooseTemplatePage from "../pages/teacher/create-game/ChooseTemplatePage";
import GameBuilderPage from "../pages/teacher/create-game/GameBuilderPage";
import EditGamePage from "../pages/teacher/create-game/EditGamePage";
import PreviewGamePage from "../pages/teacher/create-game/PreviewGamePage";
import AddQuestionsPage from "../pages/teacher/create-game/AddQuestionsPage";
import ClassPage from "../pages/teacher/ClassPage";
import AnalyticsClassPage from "../pages/teacher/analytics/AnalyticsClassPage";

/* ADMIN PAGES */
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagementPage from "../pages/admin/UserManagementPage";
import SystemLogsPage from "../pages/admin/SystemLogsPage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute role="STUDENT" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/analytics" element={<AnalyticsStudentPage />} />
            <Route path="/student/join" element={<JoinGamePage />} />
            <Route path="/student/leaderboard" element={<LeaderboardPage />} />
            <Route path="/student/leaderboard/:gameId" element={<LeaderboardPage />} />
            <Route path="/student/game/enter" element={<EnterPlayerPage />} />
            <Route path="/student/game/lobby/:sessionId" element={<GameLobbyPage />} />
            <Route path="/student/game/session/:sessionId" element={<GameSessionPage />} />
            <Route path="/student/play/:gameId" element={<PlayGamePage />} />
            <Route path="/student/result/:sessionId" element={<ResultPage />} />
          </Route>

          <Route element={<ProtectedRoute role="TEACHER" />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/projects" element={<MyProjectsPage />} />
            <Route path="/teacher/class" element={<ClassPage />} />
            <Route path="/teacher/analytics" element={<AnalyticsClassPage />} />

            {/* Step 1: Pilih Jenjang */}
            <Route path="/teacher/create/level" element={<ChooseLevelPage />} />
            {/* Step 2: Pilih Template */}
            <Route path="/teacher/create/template" element={<ChooseTemplatePage />} />
            {/* Step 3: Isi Konten */}
            <Route path="/teacher/create/builder" element={<GameBuilderPage />} />
            <Route path="/teacher/create/questions" element={<AddQuestionsPage />} />

            <Route path="/teacher/game/edit/:gameId" element={<EditGamePage />} />
            <Route path="/teacher/game/preview/:gameId" element={<PreviewGamePage />} />
          </Route>

          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/logs" element={<SystemLogsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}