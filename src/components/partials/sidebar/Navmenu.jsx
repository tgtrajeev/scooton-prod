import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
//import { Collapse } from "react-collapse";
import Icon from "@/components/ui/Icon";
//import { toggleActiveChat } from "@/pages/app/chat/store";
import { useDispatch } from "react-redux";
import useMobileMenu from "@/hooks/useMobileMenu";
import Submenu from "./Submenu";
import getRole from "../../../store/utility";

const Navmenu = ({ menus }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const[role, setRole] = useState("");
  // useEffect(() => {
  //   const role = getRole();
  //   console.log("role", role.authorities[0])
  //   setRole(role);
  // })

  const toggleSubmenu = (i) => {
    if (activeSubmenu === i) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(i);
    }
  };

  const location = useLocation();
  const locationName = location.pathname.replace("/", "");
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const dispatch = useDispatch();

  // useEffect(() => {
  //   let submenuIndex = null;
  //   menus.map((item, i) => {
  //     if (!item.child) return;
  //     if (item.link === locationName) {
  //       submenuIndex = null;
  //     } else {
  //       const ciIndex = item.child.findIndex(
  //         (ci) => ci.childlink === locationName
  //       );
  //       if (ciIndex !== -1) {
  //         submenuIndex = i;
  //       }
  //     }
  //   });
  //   document.title = `Scooton  | ${locationName}`;

  //   setActiveSubmenu(submenuIndex);
  //   //dispatch(toggleActiveChat(false));
  //   if (mobileMenu) {
  //     setMobileMenu(false);
  //   }
  // }, [location]);
  useEffect(() => {
    const role = getRole();
    let submenuIndex = null;
    const filteredMenus = menus.filter((item) => {
      if (role !== 'ROLE_SUPER_ADMIN') {
        if(item.title == "Configuration" || item.title == "Role/Permission"){
          return false;
        }
      }
      return true;
    });
  
  
    filteredMenus.forEach((item, i) => {
      if (!item.child) return;
  
      if (item.link === locationName) {
        submenuIndex = null;
      } else {
        const ciIndex = item.child.findIndex((ci) => ci.childlink === locationName);
        if (ciIndex !== -1) {
          submenuIndex = i;
        }
      }
    }); 
  
    document.title = `Scooton | ${locationName}`;
  
    setActiveSubmenu(submenuIndex);
    setFilteredMenus(filteredMenus);
  
    if (mobileMenu) {
      setMobileMenu(false);
    }
  }, [location, role, menus]);
  return (
    <>
      <ul>
        {filteredMenus.map((item, i) => (
          <li
            key={i}
            className={` single-sidebar-menu mb-2
              ${item.child ? "item-has-children" : ""}
              ${activeSubmenu === i ? "open" : ""}
              ${locationName === item.link ? "menu-item-active" : ""}`}
          >
            {/* single menu with no childred*/}
            {!item.child && !item.isHeadr && (
              <NavLink className="menu-link" to={item.link}>
                <span className="menu-icon flex-grow-0">
                  <Icon icon={item.icon} />
                </span>
                <div className="text-box flex-grow">{item.title}</div>
                {item.badge && <span className="menu-badge">{item.badge}</span>}
              </NavLink>
            )}
            {/* only for menulabel */}
            {item.isHeadr && !item.child && (
              <div className="menulabel">{item.title}</div>
            )}
            {/*    !!sub menu parent   */}
            {item.child && (
              <div
                className={`menu-link ${
                  activeSubmenu === i
                    ? "parent_active not-collapsed"
                    : "collapsed"
                }`}
                onClick={() => toggleSubmenu(i)}
              >
                <div className="flex-1 flex items-start">
                  <span className="menu-icon">
                    <Icon icon={item.icon} />
                  </span>
                  <div className="text-box">{item.title}</div>
                </div>
                <div className="flex-0">
                  <div
                    className={`menu-arrow transform transition-all duration-300 ${
                      activeSubmenu === i ? " rotate-90" : ""
                    }`}
                  >
                    <Icon icon="heroicons-outline:chevron-right" />
                  </div>
                </div>
              </div>
            )}

            <Submenu activeSubmenu={activeSubmenu} item={item} i={i} />
          </li>
        ))}
      </ul>
    </>
  );
};

export default Navmenu;
