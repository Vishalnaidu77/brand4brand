"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

const AuthContext = createContext({
  user: null,
  userRole: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Check user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || "user")
        } else {
          setUserRole("user")
        }
      } else {
        setUserRole(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Create user document in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      email,
      role: "user",
      createdAt: new Date().toISOString(),
    })
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
  )
}
