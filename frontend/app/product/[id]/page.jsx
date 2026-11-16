"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Star, ChevronLeft, ShieldCheck, Truck } from "lucide-react"
import Link from "next/link"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, "products", params.id))
        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() }
          setProduct(productData)
          setSelectedSize(productData.sizes?.[0] || "")
          setSelectedColor(productData.colors?.[0] || "")

          // Fetch related products
          const relatedQuery = query(
            collection(db, "products"),
            where("category", "==", productData.category),
            limit(4),
          )
          const relatedSnapshot = await getDocs(relatedQuery)
          const related = relatedSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((p) => p.id !== productData.id)
            .slice(0, 3)
          setRelatedProducts(related)
        } else {
          router.push("/collection")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

  const handleWhatsAppOrder = () => {
    if (!product) return
    const message = `Hi, I'm interested in ordering:
Product: ${product.name}
Size: ${selectedSize}
Color: ${selectedColor}
Price: $${product.price}`
    window.open(`https://wa.me/+918839506837?text=${encodeURIComponent(message)}`, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/collection">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Collection
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                <img
                  src={product.images?.[selectedImage] || `/placeholder.svg?height=600&width=600&query=${product.name}`}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-3">{product.originalBrand} Replica</Badge>
                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">{product.name}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? "fill-accent text-accent" : "text-muted"}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">({(product.rating || 0).toFixed(1)})</span>
                  </div>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{product.category}</span>
                </div>
                <p className="text-3xl font-bold mb-4">${product.price}</p>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Size Selection */}
              {product.sizes?.length > 0 && (
                <div>
                  <label className="text-sm font-semibold mb-3 block">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        className="min-w-[60px]"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div>
                  <label className="text-sm font-semibold mb-3 block">Select Color</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp Order Button */}
              <div className="space-y-3 pt-4 border-t border-border">
                <Button size="lg" className="w-full" onClick={handleWhatsAppOrder}>
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Order via WhatsApp
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Click to chat with us directly and place your order
                </p>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-accent" />
                  <div>
                    <p className="font-semibold text-sm">Premium Quality</p>
                    <p className="text-xs text-muted-foreground">1st Copy Guaranteed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="h-8 w-8 text-accent" />
                  <div>
                    <p className="font-semibold text-sm">Fast Delivery</p>
                    <p className="text-xs text-muted-foreground">Secure Shipping</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mb-16">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="details"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="features"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Features
                </TabsTrigger>
                <TabsTrigger
                  value="material"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Material
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    This is a premium 1st copy replica of {product.originalBrand}. Each piece is carefully crafted to
                    match the original design with attention to detail and quality materials.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="features" className="mt-6">
                <ul className="space-y-2">
                  {product.features?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="material" className="mt-6">
                <p className="text-muted-foreground leading-relaxed">{product.material}</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-serif font-bold mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                    <Card className="overflow-hidden group cursor-pointer h-full">
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        <img
                          src={
                            relatedProduct.images?.[0] ||
                            `/placeholder.svg?height=400&width=400&query=${relatedProduct.name || "/placeholder.svg"}`
                          }
                          alt={relatedProduct.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1 line-clamp-1">{relatedProduct.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{relatedProduct.originalBrand}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">${relatedProduct.price}</span>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            <span>{(relatedProduct.rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
