"use client";
import { FaUser } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";
import SearchForm from "../searchbar/searchbar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-[#16181B] border-gray-300 shadow border-gray-200 w-full">
      <div className="w-full flex flex-wrap items-center justify-center ml-[40px] mr-[40px] p-4">
        <Link href="https://flowbite.com/" className="flex items-start space-x-3 rtl:space-x-reverse">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Flowbite Logo"
          />
          <span className="self-start text-2xl font-semibold whitespace-nowrap text-white">
            FinTorr
          </span>
        </Link>
        <SearchForm />
        {/* Hamburger menu for mobile */}
        <button
          onClick={toggleMenu}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          aria-controls="navbar-default"
          aria-expanded={isOpen ? "true" : "false"}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* Navbar links */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } w-full justify-end bg-[#16181B] items-end md:block md:w-auto`}
          id="navbar-default"
        >
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 bg-[#1A1A1E] md:bg-[#16181B] dark:border-gray-700">
            <li>
              <Link
                href="/"
                className="block py-2 px-3 text-white rounded md:p-0"
                aria-current="page"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/paperTrading"
                className="block py-2 px-3 text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 md:p-0"
              >
                Paper Trading
              </Link>
            </li>
            <li>
              <Link
                href="/prediction"
                className="block py-2 px-3 text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 md:p-0"
              >
                Predictions
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block py-2 px-3 text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 md:p-0"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block py-2 px-3 text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 md:p-0"
              >
                About
              </Link>
            </li>
            <FaUser className="text-2xl text-white" />
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
