import Link from "next/link"
import { ShoppingBag, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              <span className="text-xl font-serif font-bold">Brand4Brand</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium quality products from top luxury brands at affordable prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/collection" className="hover:text-foreground transition-colors">
                  Shop Collection
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-foreground transition-colors">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/collection?category=tshirts" className="hover:text-foreground transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/collection?category=shoes" className="hover:text-foreground transition-colors">
                  Shoes
                </Link>
              </li>
              <li>
                <Link href="/collection?category=accessories" className="hover:text-foreground transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <a
              href="https://wa.me/+918839506837"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp Us
            </a>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Brand4Brand. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
