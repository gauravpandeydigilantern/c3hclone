import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaTachometerAlt,
  FaUserShield,
  FaUsers,
  FaQuoteRight,
  FaBoxes,
  FaCogs,
  FaUserSecret,
  FaToggleOn,
  FaToggleOff,
  FaCompressArrowsAlt,
} from "react-icons/fa";
import Image from "next/image";

export default function Sidebar() {
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isJobOpen, setIsJobOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const isActive = (href: string) => router.pathname === href;
  const isInsidePath = (prefix: string) => router.pathname.startsWith(prefix);

  useEffect(() => {
    setIsManageOpen(isInsidePath("/admin/manage") || isInsidePath("/admin/users") || isInsidePath("/admin/employers") || isInsidePath("/admin/testimonials") || isInsidePath("/admin/packages") || isInsidePath("/admin/services"));
    setIsJobOpen(isInsidePath("/admin/job") || isInsidePath("/admin/jobs") || isInsidePath("/admin/career-levels") || isInsidePath("/admin/qualification") || isInsidePath("/admin/job-categories") || isInsidePath("/admin/job-skills") || isInsidePath("/admin/tags") || isInsidePath("/admin/job-types") || isInsidePath("/admin/industry"));
  }, [router.pathname]);

  const toggleManage = () => setIsManageOpen(!isManageOpen);
  const toggleJob = () => setIsJobOpen(!isJobOpen);

  const activeLinkStyle = "bg-white text-black";
  const defaultLinkStyle = "hover:bg-white hover:text-black";

  return (
    <aside
      className={`sidebar bg-gray-800 text-white ${isSidebarCollapsed ? "w-20" : "w-64"
        } h-full p-4 shadow-lg transition-all duration-300`}
    >
      <h2 className="text-center text-2xl font-semibold mb-6 bg-white p-2 rounded-lg">
        {/* <button className="collapseBtn mb-4" onClick={toggleSidebar}>
          {isSidebarCollapsed ? (
            <FaToggleOn size="20" color="var(--bg-primary)" />
          ) : (
            <FaToggleOff size="20" />
          )}
        </button> */}
        {isSidebarCollapsed ? (
          <Image
            src="/images/c3h-icon.png"
            alt="C3H Global"
            width={32}
            height={34}
          />
        ) : (
          <Image
            src="/images/c3h-logo.png"
            alt="C3H Global"
            width={246}
            height={60}
          />
        )}
      </h2>

      <ul className="space-y-4">
        <li>
          <Link
            href="/admin/dashboard"
            className={`flex items-center p-2 rounded ${isActive("/admin/dashboard") ? activeLinkStyle : defaultLinkStyle
              } transition duration-200`}
          >
            <FaTachometerAlt className="iconX" />
            <span className="ml-2">Dashboard</span>
          </Link>
        </li>

        {/* Manage Section */}
        <li>
          <button
            onClick={toggleManage}
            className={`flex items-center p-2 w-full text-left rounded ${isManageOpen ? activeLinkStyle : defaultLinkStyle
              } transition duration-200`}
          >
            <FaUsers className="iconX" />
            <span className="ml-2">Manage</span>
          </button>
          {isManageOpen && (
            <ul className="space-y-2 mt-2 pl-4">
              {[
                { href: "/admin/manage-admin", icon: <FaUserShield />, label: "Admins" },
                { href: "/admin/users", icon: <FaUsers />, label: "Users" },
                { href: "/admin/employers", icon: <FaUserSecret />, label: "Employers" },
                { href: "/admin/testimonials", icon: <FaQuoteRight />, label: "Testimonials" },
                { href: "/admin/packages", icon: <FaBoxes />, label: "Packages" },
                { href: "/admin/services", icon: <FaCogs />, label: "Services" },
              ].map(({ href, icon, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center p-2 rounded ${isActive(href) ? activeLinkStyle : defaultLinkStyle
                      } transition duration-200`}
                  >
                    {icon}
                    <span className="ml-2">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>

        {/* Job Modules Section */}
        <li>
          <button
            onClick={toggleJob}
            className={`flex items-center p-2 w-full text-left rounded ${isJobOpen ? activeLinkStyle : defaultLinkStyle
              } transition duration-200`}
          >
            <FaCogs className="iconX" />
            <span className="ml-2">Job Modules</span>
          </button>
          {isJobOpen && (
            <ul className="space-y-2 mt-2 pl-4">
              {[
                { href: "/admin/jobs", label: "Jobs" },
                { href: "/admin/career-levels", label: "Career Level" },
                { href: "/admin/qualification", label: "Qualifications" },
                { href: "/admin/job-categories", label: "Jobs Categories" },
                { href: "/admin/job-skills", label: "Jobs Skill" },
                { href: "/admin/tags", label: "Tags" },
                { href: "/admin/job-types", label: "Jobs Type" },
                { href: "/admin/industry", label: "Industry" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center p-2 rounded ${isActive(href) ? activeLinkStyle : defaultLinkStyle
                      } transition duration-200`}
                  >
                    <FaCogs className="iconX" />
                    <span className="ml-2">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>

        {/* Contact Section */}
        <li>
          <Link
            href="/admin/contacts"
            className={`flex items-center p-2 rounded ${isActive("/admin/contacts") ? activeLinkStyle : defaultLinkStyle
              } transition duration-200`}
          >
            <FaCogs className="iconX" />
            <span className="ml-2">Contact</span>
          </Link>
        </li>

        {/* Applied Job */}
        <li>
          <Link
            href="/admin/applied-jobs"
            className={`flex items-center p-2 rounded ${isActive("/admin/applied-jobs")
                ? activeLinkStyle
                : defaultLinkStyle
              } transition duration-200`}
          >
            <FaCompressArrowsAlt className="iconX" />
            <span className="ml-2">Applied Job</span>
          </Link>
        </li>

        {/* Site Management */}
        <li>
          <Link
            href="/admin/site-management"
            className={`flex items-center p-2 rounded ${isActive("/admin/site-management")
                ? activeLinkStyle
                : defaultLinkStyle
              } transition duration-200`}
          >
            <FaCogs className="iconX" />
            <span className="ml-2">Site Management</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
