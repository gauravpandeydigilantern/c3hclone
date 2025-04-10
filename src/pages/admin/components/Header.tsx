import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";

export default function Header() {
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);

    const tokenData = localStorage.getItem("token");
    if (!tokenData) {
      router.push("/admin/login");
      return;
    }
    const {  expiresAt } = JSON.parse(tokenData);
    if (new Date().getTime() > expiresAt) {
      localStorage.removeItem("token");
      router.push("/admin/login");
      return;
    }

  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Hide menu if click outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [router]);

  if (!isClient) return null;

  return (
    <>
      <header className="p-4 shadow-md flex justify-between items-center">
        <h1 className="text-lg font-semibold"></h1>
        <div>


          <div className="relative inline-block text-left">
            <div>
              <div
                
                className="inline-flex align-items-center w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm  hover:bg-gray-50"
                id="menu-button"
                aria-expanded={isMenuOpen ? "true" : "false"}
                aria-haspopup="true"
                onClick={toggleMenu}
              > <FaUserCircle />
                Admin
                <svg
                  className="-mr-1 size-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {isMenuOpen && (
              <div
                ref={menuRef} 
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
              >
                <div className="py-1" role="none">
                  {/* <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    id="menu-item-0"
                  >
                    Account settings
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    id="menu-item-1"
                  >
                    Support
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    id="menu-item-2"
                  >
                    License
                  </a> */}

                    <button
                      type="submit"
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700"
                      role="menuitem" onClick={handleLogout}
                    >
                      Logout
                    </button>
                </div>
              </div>
            )}
          </div>
          {/* <button
            title="LogOut"
            className="bg-red-500 px-3 py-2 rounded text-white"
            onClick={handleLogout}
          >
            <IoIosLogOut />
          </button> */}
        </div>
      </header>
    </>
  );
}
