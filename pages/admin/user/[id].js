import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useReducer } from "react";
import { getError } from "@/utils/error";
import Layout from "@/components/Layout";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Link from "next/link";
import { getSession } from "next-auth/react";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true, errorUpdate: "" };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, errorUpdate: "" };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        loadingUpload: false,
        errorUpload: "",
      };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
}

function AdminUserEdit() {
  const { query } = useRouter();
  const userId = query.id;
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/admin/users/${userId}`);

        dispatch({ type: "FETCH_SUCCESS" });
        setValue("name", data.name);
        setValue("isAdmin", data.isAdmin);
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [userId, setValue]);

  const submitHandler = async ({ name, isAdmin }) => {
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(`/api/admin/users/${userId}`, {
        name,
        isAdmin,
      });
      dispatch({ type: "UPDATE_SUCCESS" });
      toast.success("User updated successfully");
      router.push("/admin/users");
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
      toast.error(getError(err));
    }
  };
  return (
    <Layout title={`Edit User ${userId}`}>
      <div className="grid md:grid-cols-4 md:gap-5">
        <div>
          <ul>
            <li>
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/orders">Orders</Link>
            </li>
            <li>
              <Link href="/admin/users">Products</Link>
            </li>
            <li>
              <Link className="font-bold" href="/admin/users">
                Users
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          {loading ? (
            <div className="flex justify-center overflow-hidden">
              <div
                class="animate-spin inline-block w-12 h-12 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
                role="status"
                aria-label="loading"
              >
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <form
              className="mx-auto max-w-screen-md"
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className="mb-4 text-xl">{`Edit User ${userId}`}</h1>
              <div className="mb-4">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  className="w-full"
                  id="name"
                  autoFocus
                  {...register("name", {
                    required: "Please enter name",
                  })}
                />
                {errors.name && (
                  <div className="text-red-500">{errors.name.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="isAdmin">Is Admin</label>
                <input
                  type="checkbox"
                  className="w-full"
                  id="isAdmin"
                  {...register("isAdmin")}
                />

                {errors.isAdmin && (
                  <div className="text-red-500">{errors.isAdmin.message}</div>
                )}
              </div>
              <div className="mb-4">
                <button disabled={loadingUpdate} className="primary-button">
                  {loadingUpdate ? "Loading" : "Update"}
                </button>
              </div>
              <div className="mb-4">
                <Link href={`/admin/users`}>Back</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminUserEdit.auth = { adminOnly: true };
export default AdminUserEdit;
export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session || (session && !session.user.isAdmin)) {
    return {
      redirect: {
        destination: "/unauthorized?message=admin login required",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
}
