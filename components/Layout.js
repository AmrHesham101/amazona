import { Store } from "@/utils/Store";
import Head from "next/head";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { Menu } from "@headlessui/react";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import DropdownLink from "./DropdownLink";
import Cookies from "js-cookie";
import {
  DotsVerticalIcon,
  MenuIcon,
  SearchIcon,
  XCircleIcon,
} from "@heroicons/react/outline";
import { useRouter } from "next/router";
import axios from "axios";
import { getError } from "@/utils/error";
import dynamic from "next/dynamic";
const SunIcon = dynamic(() => import("./icons/SunIcon"), { ssr: false });
const MoonIcon = dynamic(() => import("./icons/MoonIcon"), { ssr: false });

export default function Layout({ children, title }) {
  const { status, data: session } = useSession();
  const logoutRef = useRef(null);
  const orderHistoryRef = useRef(null);
  const profileRef = useRef(null);
  const adminRef = useRef(null);
  const { state, dispatch } = useContext(Store);
  const { cart, darkMode } = state;
  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const toggle = () => {
    setIsOpen(!isOpen);
  };
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`/api/products/categories`);
      setCategories(data);
    } catch (err) {
      toast.error(getError(err));
    }
  };
  useEffect(() => {
    const hideMenu = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", hideMenu);
    return () => {
      window.removeEventListener("resize", hideMenu);
    };
  }, [isOpen]);

  useEffect(() => {
    fetchCategories();
    const userMedia = window.matchMedia("(prefers-color-scheme: dark)");
    if (userMedia.matches && !Cookies.get("darkMode")) {
      dispatch({ type: "DARK_MODE_ON" });
      const root = window.document.documentElement;
      root.classList.remove("light");
      root.classList.add("dark");
    }
    if (darkMode) {
      dispatch({ type: "DARK_MODE_ON" });
      const root = window.document.documentElement;
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [darkMode, dispatch]);
  useEffect(() => {
    setCartItemCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);
  const logoutClickHandler = () => {
    Cookies.remove("cart");
    dispatch({ type: "CART_RESET" });
    signOut({ callbackUrl: "/login" });
  };
  const [query, setQuery] = useState("");

  const router = useRouter();
  const submitHandler = (e) => {
    e.preventDefault();
    router.push(`/search?query=${query}`);
  };
  const darkModeChangeHandler = () => {
    const newDarkMode = !darkMode;
    dispatch({ type: newDarkMode ? "DARK_MODE_ON" : "DARK_MODE_OFF" });
    Cookies.set("darkMode", newDarkMode ? "ON" : "OFF");

    const root = window.document.documentElement;
    root.classList.remove(newDarkMode ? "light" : "dark");
    root.classList.add(newDarkMode ? "dark" : "light");
  };
  const navMenu = () => {
    return (
      <>
        <form
          onSubmit={submitHandler}
          className="mx-auto mr-3 mt-1 flex max-w-md w-full justify-center md:hidden col-span-3"
        >
          <input
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            className="rounded-tr-none w-full rounded-br-none p-1 text-sm"
            placeholder="Search products by name"
          />
          <button
            className="rounded rounded-tl-none rounded-bl-none bg-amber-300 p-1 text-sm dark:text-black"
            type="submit"
            id="button-addon2"
          >
            <SearchIcon className="h-5 w-5"></SearchIcon>
          </button>
        </form>

        {status === "loading" ? (
          "Loading"
        ) : session?.user ? (
          <Menu as="div" className="relative inline-block ">
            <Menu.Button className="text-blue-600 dark:text-primary">
              {session.user.name}
            </Menu.Button>
            <Menu.Items className="absolute  md:right-0   w-56 origin-top-right   bg-white shadow-lg   dark:bg-black dark:shadow-gray-700">
              <Menu.Item>
                <DropdownLink
                  ref={profileRef}
                  className="dropdown-link"
                  href="/profile"
                >
                  Profile
                </DropdownLink>
              </Menu.Item>
              <Menu.Item>
                <DropdownLink
                  ref={orderHistoryRef}
                  className="dropdown-link"
                  href="/order-history"
                >
                  Order History
                </DropdownLink>
              </Menu.Item>
              {session.user.isAdmin && (
                <Menu.Item>
                  <DropdownLink
                    ref={adminRef}
                    className="dropdown-link"
                    href="/admin/dashboard"
                  >
                    Admin Dashbored
                  </DropdownLink>
                </Menu.Item>
              )}
              <Menu.Item>
                <DropdownLink
                  className="dropdown-link"
                  ref={logoutRef}
                  href="#"
                  onClick={logoutClickHandler}
                >
                  Logout
                </DropdownLink>
              </Menu.Item>
            </Menu.Items>
          </Menu>
        ) : (
          <Link className="p-2" href="/login">
            Login
          </Link>
        )}

        <div className="mx-auto p-2">
          <Link className="flex items-center p-2" href="/cart">
            Cart
            {cartItemCount > 0 && (
              <span className="ml-1 rounded-full bg-red-600 px-2 py-1 text-xs fount-bold text-white">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
        <div>
          <button type="button" className="py-2 pr-2">
            {darkMode ? (
              <SunIcon
                onClick={darkModeChangeHandler}
                className="h-5 w-5 text-blue-500 dark:text-primary "
              />
            ) : (
              <MoonIcon
                onClick={darkModeChangeHandler}
                className="h-5 w-5 text-blue-500 dark:text-primary "
              />
            )}
          </button>
        </div>
      </>
    );
  };
  return (
    <>
      <Head>
        <title>{title ? title : "Amazona"}</title>
        <meta name="description" content="Ecommerce Website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer position="bottom-center" limit={1} />

      <div className="flex min-h-screen flex-col justify-between bg-white text-black transition-all  dark:bg-black dark:text-white">
        <div>
          <nav
            className="relative flex h-12 items-center  justify-between shadow-md dark:shadow-gray-700 "
            role="navigation"
          >
            <div className="flex items-center">
              <div
                className="cursor-pointer px-4  "
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <MenuIcon className="h-5 w-5 text-blue-500 dark:text-primary"></MenuIcon>
              </div>
              <Link
                className="text-lg font-bold "
                href="/"
              >
                amazona
              </Link>
            </div>
            <form
              onSubmit={submitHandler}
              className="mx-auto  hidden max-w-md w-full  justify-center md:flex "
            >
              <input
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                className="rounded-tr-none rounded-br-none p-1 w-full  text-sm focus:ring-0 "
                placeholder="Search products by name"
              />
              <button
                className="rounded rounded-tl-none rounded-bl-none bg-blue-500 dark:bg-primary p-1 text-sm dark:text-black"
                type="submit"
                id="button-addon2"
              >
                <SearchIcon className="h-5 w-5"></SearchIcon>
              </button>
            </form>
            <div className="cursor-pointer px-4 md:hidden" onClick={toggle}>
              <DotsVerticalIcon className="h-5 w-5 text-blue-500 dark:text-primary"></DotsVerticalIcon>
            </div>
            <div className="hidden items-center md:flex">{navMenu()}</div>
          </nav>
          <div
            className={
              isOpen
                ? "grid grid-rows-2  grid-cols-3  items-center text-center"
                : "hidden"
            }
          >
            {navMenu()}
          </div>
          <div
            className={`fixed top-0 left-0 z-40 h-full w-[20rem] bg-gray-300 p-10 duration-300  ease-in-out dark:bg-gray-800 ${
              showSidebar ? "translate-x-0" : "translate-x-[-20rem]"
            }`}
          >
            <div className="mb-2 flex justify-between">
              <h2>Shopping By Categories</h2>
              <button onClick={() => setShowSidebar(!showSidebar)}>
                <XCircleIcon className="h-5 w-5  "></XCircleIcon>
              </button>
            </div>
            <ul>
              {categories.map((category) => (
                <li key={category} onClick={() => setShowSidebar(false)}>
                  <Link href={`/search?category=${category}`}>{category}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="container m-auto mt-4 px-4">{children}</div>
        <div className="flex h-10 items-center justify-center shadow-inner dark:shadow-gray-700">
          <p>Copyright © 2022 Amazona</p>
        </div>
      </div>
    </>
  );
}
