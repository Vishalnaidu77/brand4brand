"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
    images: [],
  })

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const docRef = doc(db, "products", params.id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        setFormData({
          ...data,
          price: data.price?.toString() || "",
          stock: data.stock?.toString() || "",
          images: data.images || [],
        })
        setImagePreviews(data.images || [])
      } else {
        toast({
          title: "Error",
          description: "Product not found",
          variant: "destructive",
        })
        router.push("/admin/products")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Error",
        description: "Failed to fetch product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length + imageFiles.length + (formData.images?.length || 0) > 5) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 5 images",
        variant: "destructive",
      })
      return
    }

    const oversizedFiles = files.filter(file => file.size > 2 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Each image must be less than 2MB",
        variant: "destructive",
      })
      return
    }

    setImageFiles([...imageFiles, ...files])

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeExistingImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const removeNewImage = (index) => {
    const existingCount = formData.images?.length || 0
    const newImageIndex = index - existingCount
    
    setImageFiles(imageFiles.filter((_, i) => i !== newImageIndex))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const uploadImageWithProgress = (file, index) => {
    return new Promise((resolve, reject) => {
      const uniqueName = `products/${Date.now()}-${index}-${file.name}`
      const storageRef = ref(storage, uniqueName)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          reject(error)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        }
      )
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.originalBrand || !formData.category || !formData.price || !formData.stock) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    setUploadProgress(0)

    try {
      let allImageUrls = [...(formData.images || [])]

      if (imageFiles.length > 0) {
        toast({
          title: "Uploading new images...",
          description: "Please wait",
        })

        for (let i = 0; i < imageFiles.length; i++) {
          const url = await uploadImageWithProgress(imageFiles[i], i)
          allImageUrls.push(url)
        }
      }

      const docRef = doc(db, "products", params.id)
      await updateDoc(docRef, {
        name: formData.name,
        originalBrand: formData.originalBrand,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description || "",
        features: formData.features || "",
        specifications: formData.specifications || "",
        images: allImageUrls,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Success! 🎉",
        description: "Product updated successfully",
      })

      router.push("/admin/products")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
      setUploadProgress(0)
    }
  }

  if (loading) {
    return (
      <AdminRouteGuard>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </main>
          <Footer />
        </div>
      </AdminRouteGuard>
    )
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-serif font-bold mb-8">Edit Product</h1>

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
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => 
                                index < (formData.images?.length || 0)
                                  ? removeExistingImage(index)
                                  : removeNewImage(index)
                              }
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={saving}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {imagePreviews.length < 5 && (
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to add more images
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            disabled={saving}
                          />
                        </label>
                      </div>
                    )}

                    {saving && uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
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
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
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
