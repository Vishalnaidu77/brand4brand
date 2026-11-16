"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"


export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(collection(db, "testimonials"), orderBy("date", "desc"))
        const querySnapshot = await getDocs(q)
        const testimonialsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTestimonials(testimonialsData)
      } catch (error) {
        console.error("Error fetching testimonials:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const averageRating =
    testimonials.length > 0
      ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
      : "0.0"

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-muted/30 py-16 border-b border-border">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Customer Reviews</h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Hear what our customers have to say about their experience with LuxeReplica
            </p>
            {testimonials.length > 0 && (
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${i < Math.floor(Number.parseFloat(averageRating)) ? "fill-accent text-accent" : "text-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-semibold">{averageRating}</span>
                <span className="text-muted-foreground">({testimonials.length} reviews)</span>
              </div>
            )}
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 text-muted-foreground">Loading testimonials...</p>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">No testimonials yet</p>
                <p className="text-sm text-muted-foreground">Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <Quote className="h-8 w-8 text-accent/20 mb-4" />
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold">{testimonial.name}</h3>
                            {testimonial.verified && (
                              <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < testimonial.rating ? "fill-accent text-accent" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-3">{testimonial.review}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Product: <span className="font-medium">{testimonial.product}</span>
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(testimonial.date).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-serif font-bold mb-6">Why Customers Trust Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">5000+</div>
                  <p className="text-muted-foreground">Happy Customers</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">98%</div>
                  <p className="text-muted-foreground">Satisfaction Rate</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">4.8</div>
                  <p className="text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
