import React, { useState } from "react";
import { Collapse } from "react-collapse";
import { NavLink, useLocation } from "react-router-dom";
import Icon from "@/components/ui/Icon";

const Submenu = ({ activeSubmenu, item, i }) => {
  const [activeMultiMenu, setMultiMenu] = useState(null);
  const location = useLocation();

  const isSubmenuActive = (submenu) => {
    if (submenu.child) {
      return submenu.child.some((child) => location.pathname.includes(child.childlink));
    }
    return location.pathname.includes(submenu.childlink);
  };

  const toggleMultiMenu = (j) => {
    setMultiMenu(activeMultiMenu === j ? null : j);
  };

  return (
    <Collapse isOpened={activeSubmenu === i}>
      <ul className="sub-menu space-y-4">
        {item.child?.map((subItem, j) => {
          const submenuActive = isSubmenuActive(subItem);

          return (
            <li key={j} className="block pl-4 pr-1 first:pt-4 last:pb-4">
              {subItem?.child ? (
                <div>
                  {/* Parent Item */}
                  <div
                    onClick={() => toggleMultiMenu(j)}
                    className={`${
                      submenuActive ? " text-black dark:text-white font-medium" : "text-slate-600 dark:text-slate-300"
                    } text-sm flex space-x-3 items-center transition-all duration-150 cursor-pointer`}
                  >
                    <span
                      className={`${
                        submenuActive ? " bg-scooton-900 dark:bg-slate-300 ring-4 ring-opacity-[15%]" : ""
                      } h-2 w-2 rounded-full border border-slate-600 dark:border-white inline-block flex-none`}
                    ></span>
                    <span className="flex-1">{subItem.childtitle}</span>
                    <span className="flex-none">
                      <span className={`menu-arrow transform transition-all duration-300 ${activeMultiMenu === j ? " rotate-90" : ""}`}>
                        <Icon icon="ph:caret-right" />
                      </span>
                    </span>
                  </div>

                  {/* Child Items */}
                  <Collapse isOpened={activeMultiMenu === j}>
                    <ul className="ml-4 space-y-2">
                      {subItem.child.map((submenu, index) => (
                        <li key={index} className="pl-2">
                          <NavLink to={submenu.childlink}>
                            {({ isActive }) => (
                              <span
                                className={`${
                                  isActive ? " text-black dark:text-white font-medium" : "text-slate-600 dark:text-slate-300"
                                } text-sm flex space-x-3 items-center transition-all duration-150 mt-2`}
                              >
                                <span
                                  className={`${
                                    isActive ? " bg-scooton-900 dark:bg-slate-300 ring-4 ring-opacity-[15%] ring-opacity-[15%] ring-black-500 dark:ring-slate-300 dark:ring-opacity-20" : ""
                                  } h-2 w-2 rounded-full border border-slate-600 dark:border-white inline-block flex-none`}
                                ></span>
                                <span className="flex-1">{submenu.childtitle}</span>
                              </span>
                            )}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </Collapse>
                </div>
              ) : (
                <NavLink to={subItem.childlink}>
                  {({ isActive }) => (
                    <span
                      className={`${
                        isActive ? " text-black dark:text-white font-medium" : "text-slate-600 dark:text-slate-300"
                      } text-sm flex space-x-3 items-center transition-all duration-150`}
                    >
                      <span
                        className={`${
                          isActive ? " bg-scooton-900 dark:bg-slate-300 ring-4 ring-opacity-[15%] ring-opacity-[15%] ring-black-500 dark:ring-slate-300 dark:ring-opacity-20" : ""
                        } h-2 w-2 rounded-full border border-slate-600 dark:border-white inline-block flex-none`}
                      ></span>
                      <span className="flex-1">{subItem.childtitle}</span>
                    </span>
                  )}
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </Collapse>
  );
};

export default Submenu;
