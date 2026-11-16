"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { MessageCircle, ShieldCheck, Truck, Star } from "lucide-react"
import { useGSAP } from '@gsap/react'
import { useRef } from "react"
import gsap from "gsap"

export default function HomePage() {
  const containerRef = useRef(null)
  const heroTextRef = useRef(null)

  const videoUrl = "https://res.cloudinary.com/dttpfxkjl/video/upload/v1772468364/Brannd4brand_Hero_animation_l3yix6.webm"

  useGSAP(() => {
    const text = heroTextRef.current
    const originalText = text.innerText
    
    text.innerHTML = originalText
      .split("")
      .map((char) => 
        char === " " 
          ? `<span class="inline-block">&nbsp;</span>` 
          : `<span class="inline-block opacity-0">${char}</span>`
      )
      .join("")

    const chars = text.querySelectorAll("span")

    gsap.fromTo(
      chars,
      {
        opacity: 0,
        y: 100,
        rotateX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 0.3,
      }
    )
  }, { scope: containerRef })

  // Product images array
  const products = [
    { id: 1, name: "Over-Sized T-shirt", image: "/item5.png" },
    { id: 2, name: "Premium Black T-shirt", image: "/item2.png" },
    { id: 3, name: "Printed T-shirt", image: "/item.jpeg" },
    { id: 4, name: "Minimum print classic T-shirt", image: "/item4.jpeg" },
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 
            ref={heroTextRef}
            className="text-[5.5rem] md:text-[6.7rem] font-racing font-bold mb-6 tracking-wider"
            style={{ perspective: '1000px' }}
          >
            BRAND 4 BRAND
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Experience premium quality replicas of the world's most coveted luxury brands
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-[oklch(0.9_0.08_85)] hover:bg-[oklch(0.85_0.08_85)] text-[oklch(0.15_0.01_85)] hover:!text-black hover:scale-105 font-semibold">
              <Link href="/collection">Shop Collection</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white text-white hover:!bg-[#EAD5AB] hover:!text-black hover:!border-[#EAD5AB] transition-all duration-300 hover:scale-105"
            >
              <Link href="https://wa.me/+918839506837">
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 text-center">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-[oklch(0.9_0.08_85)]" />
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">
                1st copy products with exceptional attention to detail
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 text-center">
              <Truck className="w-12 h-12 mx-auto mb-4 text-[oklch(0.9_0.08_85)]" />
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Quick and secure shipping to your doorstep
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-[oklch(0.9_0.08_85)]" />
              <h3 className="text-xl font-semibold mb-2">WhatsApp Orders</h3>
              <p className="text-muted-foreground">
                Easy ordering through direct WhatsApp communication
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Collection</h2>
          <p className="text-center text-muted-foreground mb-12">
            Discover our handpicked selection of luxury replicas
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all hover:scale-105 cursor-pointer group">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/400x400/EAD5AB/000000?text=${product.name}`
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-[oklch(0.9_0.08_85)] text-[oklch(0.15_0.01_85)] px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Coming Soon
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Brand4Brand</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">₹1111/-</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[oklch(0.9_0.08_85)] text-[oklch(0.9_0.08_85)]" />
                      <span className="text-sm">4.8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-[oklch(0.9_0.08_85)] hover:bg-[oklch(0.85_0.08_85)] text-[oklch(0.15_0.01_85)] hover:scale-105 transition-transform">
              <Link href="/collection">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Why Choose Brand4Brand?</h2>
        <p className="text-muted-foreground mb-4">
          We specialize in providing high-quality 1st copy replicas of luxury brands. 
          Each product is carefully crafted to match the original design, offering you 
          the luxury experience at a fraction of the price.
        </p>
        <p className="text-muted-foreground">
          With direct WhatsApp ordering, you can connect with us instantly to discuss 
          your needs, verify product details, and place your order with confidence.
        </p>
      </section>

      <Footer />
    </div>
  )
}
