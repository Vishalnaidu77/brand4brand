"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"
import { Star, Search, MessageCircle } from "lucide-react"

export default function CollectionPage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("featured")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"))
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = [...products]

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      )
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.originalBrand
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    }

    if (sortBy === "price-low") {
      filtered.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => Number(b.price) - Number(a.price))
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => Number(b.rating) - Number(a.rating))
    }

    setFilteredProducts(filtered)
  }, [products, categoryFilter, searchQuery, sortBy])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-muted/30 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-center">
              Our Collection
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
              Browse our curated selection of premium luxury replicas
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 z-40 bg-background border-b border-border py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-auto flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products or brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="shoes">Shoes</SelectItem>
                    <SelectItem value="watches">Watches</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent" />
                <p className="mt-4 text-muted-foreground">
                  Loading products...
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">
                  No products found
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setCategoryFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-muted-foreground">
                  Showing {filteredProducts.length} products
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                    >
                      <Card className="group cursor-pointer h-full flex flex-col">
                        <div className="aspect-square relative overflow-hidden bg-muted">
                          <img
                            src={
                              product.images?.[0] ||
                              `/placeholder.svg?query=${product.name}`
                            }
                            alt={product.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-3 right-3 bg-background/90 px-2 py-1 rounded text-xs">
                            {product.originalBrand}
                          </div>
                        </div>

                        <CardContent className="p-4 flex flex-col flex-1">
                          <h3 className="font-semibold mb-1 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {product.category}
                          </p>

                          <div className="mt-auto">
                            <div className="flex justify-between mb-2">
                              <span className="text-lg font-semibold">
                                ${product.price}
                              </span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-accent text-accent" />
                                <span>
                                  {Number(product.rating).toFixed(1)}
                                </span>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              asChild
                            >
                              <a
                                href={`https://wa.me/+918839506837?text=Hi, I'm interested in ${product.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Order via WhatsApp
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
