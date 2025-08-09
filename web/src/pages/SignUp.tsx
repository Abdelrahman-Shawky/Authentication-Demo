import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../store/auth";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


// Same constraints as backend:
const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      "Min 8 chars, include a letter, a number, and a special character"
    ),
});

type FormValues = z.infer<typeof schema>;

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await signup(values);
      navigate("/");          
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError(
          "email",
          { type: "server", message: "This email is already registered" },
          { shouldFocus: true }
        );
        return;
      }
      setError("email", { type: "server", message: "Could not create account. Please try again." });
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-gray-600">Join us and get started in seconds.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-4 focus:ring-blue-100"
              aria-invalid={!!errors.email || undefined}
            />
            {errors.email && (
              <span className="mt-1 block text-xs text-red-600" role="alert">
                {errors.email.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Name</span>
            <input
              {...register("name")}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-4 focus:ring-blue-100"
            />
            {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span>}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-4 focus:ring-blue-100"
            />
            {errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/signin" className="font-medium text-blue-700 underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
