import { Store } from "@/utils/Store";
import Head from "next/head";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import { Menu } from "@headlessui/react";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import DropdownLink from "./DropdownLink";
import Cookies from "js-cookie";

export default function Layout({ children, title }) {
  const { status, data: session } = useSession();
  const logoutRef = useRef(null);
  const orderHistoryRef = useRef(null);
  const profileRef = useRef(null);
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [cartItemCount, setCartItemCount] = useState(0);
  useEffect(() => {
    setCartItemCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);
  const logoutClickHandler = () => {
    Cookies.remove("cart");
    dispatch({ type: "CART_RESET" });
    signOut({ callbackUrl: "/login" });
  };
  return (
    <>
      <Head>
        <title>{title ? title + " - Amazona" : "Amazona"}</title>
        <meta name="description" content="Ecommerce Website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer position="bottom-center" limit={1} />
      <div className="flex min-h-screen flex-col justify-between">
        <header>
          <nav className="flex h-12 items-center px-4 justify-between shadow-md">
            <Link className="text-lg font-bold" href="/">
              amazona
            </Link>
            <div>
              <Link className="p-2" href="/cart">
                Cart
                {cartItemCount > 0 && (
                  <span className="ml-1 rounded-full bg-red-600 px-2 py-1 text-xs fount-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {status === "loading" ? (
                "loading"
              ) : session?.user ? (
                <Menu as="div" className="relative inline-block">
                  <Menu.Button className="text-blue-600">
                    {session.user.name}
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 w-56 origin-top-right bg-white sahdow-lg">
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
            </div>
          </nav>
        </header>
        <main className="container m-auto mt-4 px-4">{children}</main>
        <footer className="flex h-10 justify-center items-center  shadow-inner">
          <p>Copyright 2022 Amazona</p>
        </footer>
      </div>
    </>
  );
}
