"use client"

import { useEffect, useState } from "react"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  LogOut
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminDashboardPage() {
  const { user, userRole, signOut } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch users count
      const usersSnap = await getDocs(collection(db, "users"))
      const totalUsers = usersSnap.size

      // Fetch products count
      const productsSnap = await getDocs(collection(db, "products"))
      const totalProducts = productsSnap.size

      setStats({
        totalUsers,
        totalProducts,
        totalOrders: 0, // Add when you have orders collection
        totalRevenue: 0 // Calculate from orders
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            {/* Welcome Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back, {user?.email}
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Products
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    In catalog
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Orders
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total earnings
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button asChild className="h-auto py-6">
                    <Link href="/admin/products">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-6 w-6" />
                        <span>Manage Products</span>
                      </div>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-6">
                    <Link href="/admin/users">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-6 w-6" />
                        <span>Manage Users</span>
                      </div>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto py-6">
                    <Link href="/admin/orders">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="h-6 w-6" />
                        <span>View Orders</span>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </AdminRouteGuard>
  )
}