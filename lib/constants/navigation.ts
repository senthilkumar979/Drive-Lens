import {
  BarChart3,
  BatteryCharging,
  Car,
  FileText,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Route,
  Settings,
  Wrench,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Vehicle", href: "/vehicle", icon: Car },
  { title: "Trips", href: "/trips", icon: Route },
  { title: "Charging", href: "/charging", icon: BatteryCharging },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Favorites", href: "/favorites", icon: Heart },
  { title: "Maintenance", href: "/maintenance", icon: Wrench },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Assistant", href: "/assistant", icon: MessageSquare },
  { title: "Settings", href: "/settings", icon: Settings },
];

export const BRAND = {
  name: "DriveLens",
  tagline: "Understand Every Journey.",
  productionUrl: "https://drive-lens-one.vercel.app",
} as const;
