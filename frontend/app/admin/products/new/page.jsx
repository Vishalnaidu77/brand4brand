"use client"

import { useState } from "react"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, addDoc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import imageCompression from 'browser-image-compression'

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  
  const [formData, setFormData] = useState({
    name: "",
    originalBrand: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    features: "",
    specifications: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files)
    
    // Limit to 5 images
    if (files.length + imageFiles.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 5 images",
        variant: "destructive",
      })
      return
    }

    // Check file sizes (max 2MB each)
    const oversizedFiles = files.filter(file => file.size > 2 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Each image must be less than 2MB",
        variant: "destructive",
      })
      return
    }

    const compressedFiles = await Promise.all(
      files.map(file => imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
      }))
    )
    
    setImageFiles([...imageFiles, ...compressedFiles])

    // Generate previews
    compressedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const getUploadErrorMessage = (error) => {
    if (!error?.code) return error?.message || "Failed to upload images"

    switch (error.code) {
      case "storage/unauthorized":
        return "Storage permission denied. Check Firebase Storage rules for your signed-in admin user."
      case "storage/canceled":
        return "Upload canceled. Please try again."
      case "storage/retry-limit-exceeded":
        return "Upload timed out due to a slow or unstable connection."
      case "storage/quota-exceeded":
        return "Storage quota exceeded on Firebase."
      case "storage/invalid-format":
      case "storage/invalid-argument":
        return "Invalid image file. Please try a different image."
      case "storage/bucket-not-found":
        return "Storage bucket not found. Check NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET."
      case "storage/object-not-found":
        return "Uploaded file not found in storage. Please retry."
      default:
        return error.message || "Failed to upload images"
    }
  }

  const uploadImageWithProgress = (file, index, totalFiles) => {
    return new Promise((resolve, reject) => {
      const uniqueName = `${Date.now()}-${index}-${file.name}`
      const storageRef = ref(storage, `products/${uniqueName}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      const timeout = setTimeout(() => {
        uploadTask.cancel()
        reject({ code: "storage/retry-limit-exceeded" })
      }, 90000)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          const overallProgress = ((index + fileProgress / 100) / totalFiles) * 100
          setUploadProgress(overallProgress)
        },
        (error) => {
          clearTimeout(timeout)
          reject(error)
        },
        async () => {
          clearTimeout(timeout)
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(url)
        }
      )
    })
  }

  const uploadImages = async (files) => {
    const urls = []

    for (let index = 0; index < files.length; index++) {
      const url = await uploadImageWithProgress(files[index], index, files.length)
      urls.push(url)
    }

    return urls
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.originalBrand || !formData.category || !formData.price || !formData.stock) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (imageFiles.length === 0) {
      toast({
        title: "No images",
        description: "Please upload at least one product image",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      if (!storage?.app?.options?.storageBucket) {
        throw new Error("Firebase Storage bucket is missing. Set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in your environment.")
      }

      toast({
        title: "Uploading images...",
        description: "Please wait",
      })
      
      const imageUrls = await uploadImages(imageFiles)

      toast({
        title: "Creating product...",
        description: "Almost done",
      })

      await addDoc(collection(db, "products"), {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: imageUrls,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Success! 🎉",
        description: "Product created successfully",
      })

      router.push("/admin/products")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: getUploadErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-serif font-bold mb-8">Add New Product</h1>

            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Luxury Watch"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="originalBrand">Original Brand *</Label>
                    <Input
                      id="originalBrand"
                      name="originalBrand"
                      value={formData.originalBrand}
                      onChange={handleChange}
                      placeholder="e.g., Rolex"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g., Watch"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="99.99"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Product description..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="features">Features (one per line)</Label>
                    <Textarea
                      id="features"
                      name="features"
                      value={formData.features}
                      onChange={handleChange}
                      placeholder="Premium materials&#10;Swiss movement&#10;Water resistant"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specifications">Specifications</Label>
                    <Textarea
                      id="specifications"
                      name="specifications"
                      value={formData.specifications}
                      onChange={handleChange}
                      placeholder="Case: 40mm stainless steel&#10;Movement: Automatic&#10;Water resistance: 100m"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Product Images (Max 5, up to 2MB each)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload images
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG up to 2MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          disabled={loading}
                        />
                      </label>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={loading}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {loading && uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading images...</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
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
                      Creating...
                    </>
                  ) : (
                    "Create Product"
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
