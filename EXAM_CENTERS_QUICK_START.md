# Exam Centers Module - Quick Start & Usage Guide

## 🚀 Getting Started

### Prerequisites

```bash
# Ensure dependencies are installed
npm install

# or if using yarn
yarn install
```

### Running the Application

```bash
npm run dev
# Application runs on http://localhost:3000
```

---

## 📄 Component Overview

### 1. List Page

**Route**: `/admin/exam-centers`  
**File**: `app/(protected)/exam-centers/page.tsx`  
**Features**: View, filter, sort, delete, and bulk manage exam centers

**Key Components**:

- Gradient header with stats
- Advanced filtering
- Data table with sorting
- Bulk actions
- FAB for mobile

**Usage**:

```tsx
import ExamCentersList from "@/app/(protected)/exam-centers/page";

export default function Page() {
  return <ExamCentersList />;
}
```

---

### 2. Create/Edit Form

**Route**: `/admin/exam-centers/new` or `/admin/exam-centers/:id`  
**File**: `app/(protected)/exam-centers/ExamCenterFormModern.tsx`  
**Features**: Multi-step form for creating/editing centers

**Steps**:

1. Basic Information (Name, Code, Website)
2. Location & Address (State, City, Address)
3. Contact Details (Phone, Email, Contact Person)
4. Year & Status (Established Year, Status)
5. Additional Info (Notes, Logo)

**Usage**:

```tsx
import ExamCenterForm from "@/app/(protected)/exam-centers/ExamCenterFormModern";

export default function CreatePage() {
  return (
    <ExamCenterForm
      initialData={null} // for create
      // or
      // initialData={centerData} // for edit
    />
  );
}
```

---

### 3. CSV Import Modal

**Trigger**: "Import" button on list page  
**File**: `app/(protected)/exam-centers/CSVImportModal.tsx`  
**Features**: Bulk import centers from CSV file

**Steps**:

1. Download template
2. Upload file
3. Review & import

**Usage**:

```tsx
import CSVImportModal from "@/app/(protected)/exam-centers/CSVImportModal";

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Import CSV</Button>

      {showModal && (
        <CSVImportModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            // Refresh data
          }}
        />
      )}
    </>
  );
}
```

---

## 🎨 Customization Guide

### Change Gradient Color

In any component file:

```tsx
sx={{
  background: "linear-gradient(135deg, #NEW_COLOR1 0%, #NEW_COLOR2 100%)",
}}
```

**Current Colors**:

- Start: `#667eea` (Blue)
- End: `#764ba2` (Purple)

### Change Border Radius

```tsx
sx={{
  borderRadius: 3, // Change from 2
}}
```

### Change Table Colors

In `page.tsx`, find the table and modify:

```tsx
<TableRow sx={{ bgcolor: "grey.50" }}> {/* Change color */}
```

### Change Button Styles

```tsx
<Button
  variant="contained" // or "outlined", "text"
  size="small" // or "medium", "large"
  color="primary" // or "secondary", "error", "success"
  sx={{
    background: "linear-gradient(...)", // or remove for default
  }}
>
  Label
</Button>
```

---

## 📋 Common Tasks

### Add a New Column to List

1. Open `app/(protected)/exam-centers/page.tsx`
2. Find the `columns` array
3. Add new column object:

```tsx
{
  accessorKey: "newField",
  header: "New Field",
  size: 150,
  Cell: ({ row }) => (
    <Typography variant="body2">
      {row.original.newField}
    </Typography>
  ),
}
```

### Add a New Form Field

1. Open `app/(protected)/exam-centers/ExamCenterFormModern.tsx`
2. Find the appropriate step
3. Add to the form structure:

```tsx
<TextField
  label="Field Label"
  value={formData.newField || ""}
  onChange={(e) =>
    setFormData({
      ...formData,
      newField: e.target.value,
    })
  }
  fullWidth
/>
```

### Add a New Filter

1. Open `app/(protected)/exam-centers/page.tsx`
2. Find the `FilterPanel` component
3. Add filter UI:

```tsx
<Stack spacing={2}>
  <FormControl fullWidth size="small">
    <InputLabel>New Filter</InputLabel>
    <Select
      value={filters.newFilter || ""}
      onChange={(e) =>
        setFilters({
          ...filters,
          newFilter: e.target.value,
        })
      }
    >
      <MenuItem value="">All</MenuItem>
      <MenuItem value="option1">Option 1</MenuItem>
      <MenuItem value="option2">Option 2</MenuItem>
    </Select>
  </FormControl>
</Stack>
```

### Change Modal Steps

1. Open `app/(protected)/exam-centers/CSVImportModal.tsx`
2. Find the `steps` array:

```tsx
const steps = ["Your Step 1", "Your Step 2", "Your Step 3"];
```

3. Add conditional rendering:

```tsx
{
  activeStep === 0 && <YourStepOne />;
}
{
  activeStep === 1 && <YourStepTwo />;
}
{
  activeStep === 2 && <YourStepThree />;
}
```

---

## 🔧 API Integration

### List Data Fetching

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ["exam-centers"],
  queryFn: async () => {
    const response = await fetch("/api/exam-centers");
    return response.json();
  },
});
```

### Create/Update

```tsx
const mutation = useMutation({
  mutationFn: async (data) => {
    const url = isEdit ? `/api/exam-centers/${data.id}` : "/api/exam-centers";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
});
```

### Delete

```tsx
const deleteMutation = useMutation({
  mutationFn: async (id) => {
    const response = await fetch(`/api/exam-centers/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },
});
```

### CSV Import

```tsx
const handleImport = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/exam-centers/import", {
    method: "POST",
    body: formData,
  });
  return response.json();
};
```

---

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Test Example

```tsx
import { render, screen } from "@testing-library/react";
import ExamCentersList from "./page";

describe("Exam Centers List", () => {
  it("should render the list page", () => {
    render(<ExamCentersList />);
    expect(screen.getByText("Exam Centers")).toBeInTheDocument();
  });

  it("should display the gradient header", () => {
    render(<ExamCentersList />);
    const header = screen.getByRole("heading", { name: /exam centers/i });
    expect(header).toHaveStyle({
      background: expect.stringContaining("linear-gradient"),
    });
  });
});
```

---

## 🐛 Troubleshooting

### Modal Not Showing

**Problem**: CSVImportModal not displaying

**Solution**:

```tsx
{
  showModal && <CSVImportModal onClose={() => setShowModal(false)} />;
}
```

Ensure `showModal` state is properly managed.

### Form Hydration Error

**Problem**: "Text content does not match" error

**Solution**: Already handled! The form includes:

```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return <LoadingState />;
```

### Table Not Updating

**Problem**: Data doesn't refresh after create/update

**Solution**: Invalidate and refetch the query:

```tsx
queryClient.invalidateQueries({
  queryKey: ["exam-centers"],
});
```

### Styling Not Applied

**Problem**: sx props not working

**Solution**:

- Ensure component is wrapped in ThemeProvider
- Check that `@mui/material` is imported
- Verify component is a Material-UI component

---

## 📚 Resources

### Documentation Files

- `EXAM_CENTERS_UI_REDESIGN.md` - Detailed redesign docs
- `CSV_IMPORT_MODAL_UPDATE.md` - Modal transformation
- `MODAL_BEFORE_AFTER.md` - Visual comparisons
- `EXAM_CENTERS_COMPLETE_SUMMARY.md` - Complete overview

### External References

- [Material-UI Documentation](https://mui.com/material-ui/)
- [Material React Table Docs](https://www.material-react-table.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)

---

## 🎯 Best Practices

### Code Style

- Use Material-UI components for UI
- Use `sx` prop for styling (not className)
- Use TypeScript for type safety
- Follow component naming conventions

### Performance

- Use React Query for data fetching
- Memoize components where needed
- Lazy load heavy components
- Avoid inline function definitions

### Accessibility

- Always use semantic HTML
- Include ARIA labels
- Test with keyboard navigation
- Ensure color contrast

### Security

- Validate all inputs
- Use parameterized queries
- Sanitize CSV data
- Implement proper authentication

---

## 📞 Support

### Getting Help

1. Check the documentation files
2. Review existing code patterns
3. Check Material-UI documentation
4. Search for similar implementations

### Reporting Issues

Include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages
- Browser/device info

---

## 🎓 Learning Path

### Beginner

1. Read `EXAM_CENTERS_COMPLETE_SUMMARY.md`
2. Explore the list page (`page.tsx`)
3. Try making small styling changes
4. Understand the basic structure

### Intermediate

1. Review the form component
2. Understand step-based navigation
3. Learn about form validation
4. Explore Material-UI components

### Advanced

1. Study the CSV modal implementation
2. Understand Material React Table customization
3. Learn data fetching patterns
4. Implement custom features

---

## ✅ Checklist for New Features

Before adding new features, ensure:

- [ ] Component uses Material-UI
- [ ] Responsive design implemented
- [ ] TypeScript types defined
- [ ] Error handling included
- [ ] Loading states shown
- [ ] Success feedback provided
- [ ] Accessibility considered
- [ ] Documentation updated
- [ ] Tests written
- [ ] Code reviewed

---

This guide should help you navigate and extend the exam centers module. Refer back to specific sections as needed!
