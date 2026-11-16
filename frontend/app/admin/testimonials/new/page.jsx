"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function NewTestimonialPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    rating: 5,
    verified: false,
  })

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await addDoc(collection(db, "testimonials"), {
        ...formData,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Success!",
        description: "Testimonial added successfully",
      })

      router.push("/admin/testimonials")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add testimonial",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-serif font-bold mb-8">Add New Testimonial</h1>

            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Testimonial Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role / Title</Label>
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="e.g., Verified Buyer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Testimonial Content *</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Write the customer's testimonial..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={formData.verified}
                      onCheckedChange={(checked) => setFormData({ ...formData, verified: Boolean(checked) })}
                    />
                    <Label htmlFor="verified" className="cursor-pointer">
                      Mark as verified purchase
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Testimonial"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </AdminRouteGuard>
  )
}
