"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"
import { SearchBar } from "@/components/search-bar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { loadPatientData, getPatientsByPage, type PatientRecord } from "@/lib/data-parser"

// Function to convert length of stay to readable format
function formatLengthOfStay(days: number): string {
  const hours = Math.round(days * 24)
  return `${hours} hrs`
}

export default function ReportsPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [allPatients, setAllPatients] = useState<PatientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPatients, setTotalPatients] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGender, setFilterGender] = useState<string>("all")
  const [filterCondition, setFilterCondition] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const pageSize = 10

  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadPatientData()

        // If no data, redirect to setup
        if (data.length === 0) {
          router.push("/setup")
          return
        }

        setAllPatients(data)

        // Apply filters
        let filteredData = data

        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          filteredData = filteredData.filter(
            (patient) =>
              patient.patientId.toLowerCase().includes(term) ||
              patient.age.toString().includes(term) ||
              patient.gender.toLowerCase().includes(term),
          )
        }

        if (filterGender !== "all") {
          filteredData = filteredData.filter((patient) => patient.gender === filterGender)
        }

        if (filterCondition !== "all") {
          filteredData = filteredData.filter((patient) => {
            switch (filterCondition) {
              case "diabetes":
                return patient.hasDiabetes
              case "hypertension":
                return patient.hasHypertension
              case "heartDisease":
                return patient.hasHeartDisease
              case "copd":
                return patient.hasCopd
              case "asthma":
                return patient.hasAsthma
              case "cancer":
                return patient.hasCancer
              default:
                return true
            }
          })
        }

        setTotalPatients(filteredData.length)
        setTotalPages(Math.ceil(filteredData.length / pageSize))

        // Get current page data
        const paginatedData = getPatientsByPage(filteredData, page, pageSize)
        setPatients(paginatedData)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load patient data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [page, searchTerm, filterGender, filterCondition, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-500">Loading patient data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => router.push("/setup")} className="bg-primary text-white px-4 py-2 rounded-md">
            Go to Setup
          </button>
        </div>
      </div>
    )
  }

  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  const goToPrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(1) // Reset to first page when searching
  }

  const handleGenderFilter = (value: string) => {
    setFilterGender(value)
    setPage(1) // Reset to first page when filtering
  }

  const handleConditionFilter = (value: string) => {
    setFilterCondition(value)
    setPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterGender("all")
    setFilterCondition("all")
    setPage(1)
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="p-4 flex items-center justify-between bg-white border-b shadow-sm">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Reports" }]} />
          <div className="w-80">
            <SearchBar />
          </div>
        </header>

        <main className="p-6">
          <Card className="shadow-sm mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Patient Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterGender} onValueChange={handleGenderFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="M">Male</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCondition} onValueChange={handleConditionFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Medical Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conditions</SelectItem>
                      <SelectItem value="diabetes">Diabetes</SelectItem>
                      <SelectItem value="hypertension">Hypertension</SelectItem>
                      <SelectItem value="heartDisease">Heart Disease</SelectItem>
                      <SelectItem value="copd">COPD</SelectItem>
                      <SelectItem value="asthma">Asthma</SelectItem>
                      <SelectItem value="cancer">Cancer</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={clearFilters} className="gap-2">
                    <Filter size={16} />
                    Clear
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Length of Stay</TableHead>
                      <TableHead>Conditions</TableHead>
                      <TableHead>Readmission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="font-medium text-primary">#{patient.patientId}</TableCell>
                          <TableCell>{patient.age}</TableCell>
                          <TableCell>{patient.gender}</TableCell>
                          <TableCell>{formatLengthOfStay(patient.lengthOfStay)}</TableCell>
                          <TableCell>{patient.totalConditions}</TableCell>
                          <TableCell>
                            <span
                              className={
                                patient.isReadmission ? "text-destructive font-medium" : "text-success font-medium"
                              }
                            >
                              {patient.isReadmission ? "Yes" : "No"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No patients found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {patients.length} of {totalPatients} patients
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={page === 1} className="gap-1">
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={page === totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

