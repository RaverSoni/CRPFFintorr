"use client";

import React, { useState } from 'react';
import Style from './module.sidebar.css';
import { RiStockLine, RiHome3Line } from "react-icons/ri";
import { GoGraph } from "react-icons/go";
import { PiGraph } from "react-icons/pi";
import { MdMenu, MdClose } from "react-icons/md"; 
import Link from "next/link";
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); 

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="hamburger" onClick={toggleSidebar}>
        {isOpen ? <MdClose /> : <MdMenu />} 
      </div>
      <div className="menuItems">
        <div className="menuItem">
          <Link href="/">
          <RiHome3Line className="sidebarIcon" />
          {isOpen && <span className="menuText">Dashboard</span>}
          </Link>
        </div>
        <Link href="/stockpage">
          <div className='menuItem'>
            <RiStockLine className='sidebarIcon' />
            {isOpen && <span className='menuText'>Stocks</span>}
          </div>
        </Link>
        <div className="menuItem">
          <GoGraph className="sidebarIcon" />
          {isOpen && <span className="menuText">Graphs</span>}
        </div>
        <div className="menuItem">
          <PiGraph className="sidebarIcon" />
          {isOpen && <span className="menuText">Reports</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
