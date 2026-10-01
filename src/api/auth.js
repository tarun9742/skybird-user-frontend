import API from "./axios"

export async function sendOtp(mobile) {
  const { data } = await API.post("/auth/customer/send-otp", { mobile })
  return data
}

export async function verifyOtp({ mobile, otp, name }) {
  const { data } = await API.post("/auth/customer/verify-otp", {
    mobile,
    otp,
    name,
  })
  return data
}

export async function getProfile() {
  const { data } = await API.get("/customer/profile")
  return data
}

export async function purchaseCourseApi(courseId) {
  const { data } = await API.post("/customer/purchase", { courseId })
  return data
}

export async function getPurchasedCourses() {
  const { data } = await API.get("/customer/purchased")
  return data
}
