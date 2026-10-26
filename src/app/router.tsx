import type { ReactElement } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { Home, ProtectedArea, RoleSection } from '@/app/guards';
import { navigation, roleBasePath, rolePath, type NavItem } from '@/app/navigation';
import { AiMatchPage } from '@/pages/AiMatchPage/AiMatchPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage/AnalyticsPage';
import { BillingPage } from '@/pages/BillingPage/BillingPage';
import { CalendarPage } from '@/pages/CalendarPage/CalendarPage';
import { DevrelApplicationsPage } from '@/pages/DevrelApplicationsPage/DevrelApplicationsPage';
import { DevrelDashboardPage } from '@/pages/DevrelDashboardPage/DevrelDashboardPage';
import { DevrelEventsPage } from '@/pages/DevrelEventsPage/DevrelEventsPage';
import { EventsCatalogPage } from '@/pages/EventsCatalogPage/EventsCatalogPage';
import { LoginPage } from '@/pages/LoginPage/LoginPage';
import { MediaPage } from '@/pages/MediaPage/MediaPage';
import { NotificationsPage } from '@/pages/NotificationsPage/NotificationsPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage/PlaceholderPage';
import { ProducerPage } from '@/pages/ProducerPage/ProducerPage';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage';
import { PublicFeedbackPage } from '@/pages/PublicFeedbackPage/PublicFeedbackPage';
import { SpeakerApplicationsPage } from '@/pages/SpeakerApplicationsPage/SpeakerApplicationsPage';
import { SpeakerCatalogPage } from '@/pages/SpeakerCatalogPage/SpeakerCatalogPage';
import { SpeakerDashboardPage } from '@/pages/SpeakerDashboardPage/SpeakerDashboardPage';
import { SpeakerInvitationsPage } from '@/pages/SpeakerInvitationsPage/SpeakerInvitationsPage';
import { SpeakerProfileViewPage } from '@/pages/SpeakerProfileViewPage/SpeakerProfileViewPage';
import { SpeakerReviewsPage } from '@/pages/SpeakerReviewsPage/SpeakerReviewsPage';
import { TalksPage } from '@/pages/TalksPage/TalksPage';
import { UiKitPage } from '@/pages/UiKitPage/UiKitPage';
import type { Role } from '@/types/role';

/** Ported screens by menu slug (group children by full path); the rest of the menu shows a placeholder. */
const pages: Record<Role, Partial<Record<string, ReactElement>>> = {
  speaker: {
    '': <SpeakerDashboardPage />,
    calendar: <CalendarPage role="speaker" />,
    profile: <ProfilePage role="speaker" />,
    talks: <TalksPage />,
    events: <EventsCatalogPage />,
    applications: <SpeakerApplicationsPage />,
    invitations: <SpeakerInvitationsPage />,
    'ai/events': <AiMatchPage role="speaker" />,
    'ai/producer': <ProducerPage />,
    reviews: <SpeakerReviewsPage />,
    media: <MediaPage />,
    billing: <BillingPage role="speaker" />,
    notifications: <NotificationsPage />,
  },
  devrel: {
    '': <DevrelDashboardPage />,
    calendar: <CalendarPage role="devrel" />,
    profile: <ProfilePage role="devrel" />,
    events: <DevrelEventsPage />,
    applications: <DevrelApplicationsPage />,
    catalog: <SpeakerCatalogPage />,
    'ai/speaker': <AiMatchPage role="devrel" />,
    analytics: <AnalyticsPage />,
    billing: <BillingPage role="devrel" />,
    notifications: <NotificationsPage />,
  },
};

/** Screens outside the menu, nested under a menu section (breadcrumbs show that section). */
const detailRoutes: Record<Role, RouteObject[]> = {
  speaker: [],
  devrel: [{ path: 'catalog/:speakerId', element: <SpeakerProfileViewPage /> }],
};

function pageRoute(role: Role, item: NavItem): RouteObject {
  const element = pages[role][item.slug] ?? <PlaceholderPage title={item.title} />;
  return item.slug ? { path: item.slug, element } : { index: true, element };
}

/** A group has no page of its own: its address opens the first child. */
function menuRoutes(role: Role, item: NavItem): RouteObject[] {
  if (!item.children) return [pageRoute(role, item)];
  return [
    { path: item.slug, element: <Navigate to={rolePath(role, item.children[0].slug)} replace /> },
    ...item.children.map((child) => pageRoute(role, child)),
  ];
}

function roleRoutes(role: Role): RouteObject {
  return {
    path: roleBasePath[role],
    element: <RoleSection role={role} />,
    children: [
      ...navigation[role].flatMap((item) => menuRoutes(role, item)),
      ...detailRoutes[role],
    ],
  };
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedArea />,
    children: [
      { path: '/', element: <Home /> },
      roleRoutes('speaker'),
      roleRoutes('devrel'),
    ],
  },
  // Public listener form: no account, no shell, no access to the speaker profile.
  { path: '/feedback/:token', element: <PublicFeedbackPage /> },
  // Component showcase for development.
  { path: '/ui-kit', element: <UiKitPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
