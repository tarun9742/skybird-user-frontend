import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  sendOtp as apiSendOtp,
  verifyOtp as apiVerifyOtp,
  purchaseCourseApi,
  getPurchasedCourses,
} from "../api/auth"

const TOKEN_KEY = "skybirds-token"
const USER_KEY = "skybirds-user"

const UserContext = createContext(null)

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [purchasedCourses, setPurchasedCourses] = useState([])

  const isAuthenticated = Boolean(token && user)

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  }, [user])

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  }, [token])

  // Load purchased courses from API
  const refreshPurchased = useCallback(async () => {
    if (!token) {
      setPurchasedCourses([])
      return
    }
    try {
      const res = await getPurchasedCourses()
      if (res.success && Array.isArray(res.data)) {
        setPurchasedCourses(res.data)
        const ids = res.data.map((c) => c.id).filter(Boolean)
        setUser((prev) =>
          prev ? { ...prev, purchasedCourseIds: ids } : prev,
        )
      }
    } catch {
      // keep existing local state
    }
  }, [token])

  useEffect(() => {
    refreshPurchased()
  }, [refreshPurchased])

  const sendOtp = useCallback(async (mobile) => {
    setLoading(true)
    try {
      const data = await apiSendOtp(mobile)
      setLoading(false)
      return {
        success: true,
        message: data.message || "OTP sent",
        debugOtp: data.debugOtp || null,
        existingUser : data?.existingUser
      }
    } catch (err) {
      setLoading(false)
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      }
    }
  }, [])

  const verifyOtp = useCallback(async ({ mobile, otp, name }) => {
    setLoading(true)
    try {
      const data = await apiVerifyOtp({ mobile, otp, name })
      if (data.success && data.token) {
        const u = {
          id: data.user.id,
          name: data.user.name || name || "Learner",
          mobile: data.user.mobile || mobile,
          email: data.user.email || "",
          purchasedCourseIds: [],
        }
        setToken(data.token)
        setUser(u)
        setLoading(false)
        return { success: true, user: u }
      }
      setLoading(false)
      return { success: false, message: data.message || "Verification failed" }
    } catch (err) {
      setLoading(false)
      return {
        success: false,
        message: err.response?.data?.message || "Invalid OTP. Please try again.",
      }
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setPurchasedCourses([])
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  const hasCourse = useCallback(
    (courseId) => {
      if (!user) return false
      const ids = user.purchasedCourseIds || []
      if (ids.includes(courseId)) return true
      return purchasedCourses.some((c) => c.id === courseId)
    },
    [user, purchasedCourses],
  )

  const purchaseCourse = useCallback(
    async (course) => {
      if (!user) return { success: false, message: "Please login first" }

      try {
        const res = await purchaseCourseApi(course.id)
        if (res.success) {
          setUser((current) => {
            if (!current) return current
            const ids = current.purchasedCourseIds || []
            if (ids.includes(course.id)) return current
            return {
              ...current,
              purchasedCourseIds: [...ids, course.id],
            }
          })
          await refreshPurchased()
          return { success: true }
        }
        return { success: false, message: res.message || "Purchase failed" }
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || "Purchase failed",
        }
      }
    },
    [user, refreshPurchased],
  )

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      loading,
      purchasedCourses,
      sendOtp,
      verifyOtp,
      logout,
      hasCourse,
      purchaseCourse,
      refreshPurchased,
    }),
    [
      user,
      token,
      isAuthenticated,
      loading,
      purchasedCourses,
      sendOtp,
      verifyOtp,
      logout,
      hasCourse,
      purchaseCourse,
      refreshPurchased,
    ],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error("useUser must be used inside UserProvider")
  return context
}
