"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminGuard } from "@/components/admin-guard"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Pencil, Trash2, Package, MessageSquare, Users } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminPage() {
  const [products, setProducts] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [orders, setOrders] = useState([])
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, id: null })

  useEffect(() => { 
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch products
      const productsSnapshot = await getDocs(collection(db, "products"))
      const productsData = productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setProducts(productsData)

      // Fetch testimonials
      const testimonialsSnapshot = await getDocs(collection(db, "testimonials"))
      const testimonialsData = testimonialsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setTestimonials(testimonialsData)

      // Fetch orders
      const ordersSnapshot = await getDocs(collection(db, "orders"))

      const ordersData = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) 
      setOrders(ordersData) 
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.type || !deleteDialog.id) return

    try {
      const collectionName =
        deleteDialog.type === "product" ? "products" : deleteDialog.type === "testimonial" ? "testimonials" : "orders"
      await deleteDoc(doc(db, collectionName, deleteDialog.id))
      await fetchData()
      setDeleteDialog({ open: false, type: null, id: null })
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your store products, orders, and testimonials</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{testimonials.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Management Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="products" className="w-full">
                  <TabsList>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                  </TabsList>

                  {/* Products Tab */}
                  <TabsContent value="products" className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Products</h3>
                        <p className="text-sm text-muted-foreground">Manage your product catalog</p>
                      </div>
                      <Button asChild>
                        <Link href="/admin/products/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Link>
                      </Button>
                    </div>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No products yet. Add your first product to get started.
                              </TableCell>
                            </TableRow>
                          ) : (
                            products.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{product.category}</Badge>
                                </TableCell>
                                <TableCell>${product.price}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={`/admin/products/${product.id}`}>
                                        <Pencil className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeleteDialog({ open: true, type: "product", id: product.id })}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  {/* Orders Tab */}
                  <TabsContent value="orders" className="mt-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">Orders</h3>
                      <p className="text-sm text-muted-foreground">View and manage customer orders from WhatsApp</p>
                    </div>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No orders yet. Orders will appear here when customers contact you via WhatsApp.
                              </TableCell>
                            </TableRow>
                          ) : (
                            orders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.customerName}</TableCell>
                                <TableCell>{order.product}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      order.status === "completed"
                                        ? "default"
                                        : order.status === "processing"
                                          ? "secondary"
                                          : "outline"
                                    }
                                  >
                                    {order.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteDialog({ open: true, type: "order", id: order.id })}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  {/* Testimonials Tab */}
                  <TabsContent value="testimonials" className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Testimonials</h3>
                        <p className="text-sm text-muted-foreground">Manage customer reviews and testimonials</p>
                      </div>
                      <Button asChild>
                        <Link href="/admin/testimonials/new">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Testimonial
                        </Link>
                      </Button>
                    </div>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {testimonials.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No testimonials yet. Add your first customer review.
                              </TableCell>
                            </TableRow>
                          ) : (
                            testimonials.map((testimonial) => (
                              <TableRow key={testimonial.id}>
                                <TableCell className="font-medium">{testimonial.name}</TableCell>
                                <TableCell>{testimonial.product}</TableCell>
                                <TableCell>{testimonial.rating} / 5</TableCell>
                                <TableCell>
                                  {testimonial.verified ? (
                                    <Badge>Verified</Badge>
                                  ) : (
                                    <Badge variant="outline">Unverified</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" asChild>
                                      <Link href={`/admin/testimonials/${testimonial.id}`}>
                                        <Pencil className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setDeleteDialog({ open: true, type: "testimonial", id: testimonial.id })
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this {deleteDialog.type}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminGuard>
  )
}
