# CSV Import Modal - Enhanced Bulk Upload with Inline Edit

## Overview

The enhanced CSV Import Modal provides a professional bulk import solution with the ability to preview, edit, and validate data before importing exam centers into the database.

## Key Features

### 1. **4-Step Guided Process**

- **Step 1**: Download Template - Get properly formatted CSV template
- **Step 2**: Upload File - Select and parse CSV file
- **Step 3**: Review & Edit - Preview data with inline editing capabilities
- **Step 4**: Confirm Import - Final review and bulk import

### 2. **Inline Edit Functionality**

- Click the **Edit** icon on any row to enter edit mode
- Edit the following fields directly in the table:
  - Center Name
  - Exam Type (NATA, JEE, BOTH)
  - State
  - City
  - Status (Active/Inactive)
- **Save** or **Cancel** your edits
- Changes appear immediately in the table

### 3. **Data Management**

- **Delete Rows**: Remove specific rows from import using the trash icon
- **Row Validation**: Visual indicators (chips) show data status
- **Row Counter**: Track total number of records ready for import
- **Scrollable Table**: Handles large datasets smoothly

### 4. **Professional UI**

- **Gradient Header**: Modern purple gradient design
- **Beautiful Material Design**: Consistent with app theme
- **Responsive Layout**: Works on all screen sizes
- **Icons & Chips**: Visual data representation
- **Progress Indication**: Clear step navigation

---

## How to Use

### Step 1: Download Template

1. Click **"Import CSV"** button on the exam centers list page
2. Click **"Download Template"** button
3. This downloads a properly formatted CSV template with:
   - Column headers
   - Example data
   - Data format specifications

### Step 2: Prepare Your Data

1. Open the downloaded template in Excel or any CSV editor
2. Fill in your exam center data
3. Ensure all required fields are populated
4. Keep the following format:
   ```
   center_name,center_code,exam_type,state,city,address,status
   NATA Center 1,NC001,NATA,Maharashtra,Mumbai,123 Main St,active
   ```

### Step 3: Upload CSV File

1. In the modal, click to upload or drag-drop your CSV file
2. The modal shows:
   - File name
   - File size
   - Upload status
3. After upload, the system parses and previews the data

### Step 4: Review & Edit Data

1. **View Preview**: See first/all rows in a formatted table
2. **Inline Edit**: Click the edit icon to modify a row
3. **Edit Fields**:
   - Type or paste new values in text fields
   - Select values from dropdowns (Exam Type, Status)
4. **Save Changes**: Click checkmark to save edits
5. **Delete Rows**: Click trash icon to remove unwanted rows
6. **Proceed**: Click "Next" when ready to import

### Step 5: Confirm & Import

1. Final confirmation screen shows:
   - Total record count
   - Summary of what will be imported
2. Click **"Import Now"** to process all records
3. System displays:
   - Import progress
   - Success count
   - Failed count (if any)
   - Error details for failed records

---

## Component Details

### CSVImportModalEnhanced.tsx

**Location**: `app/(protected)/exam-centers/CSVImportModalEnhanced.tsx`

**Key Props**:

```typescript
interface CSVImportModalProps {
  onClose: () => void; // Called when modal closes
  onImportComplete: () => void; // Called after successful import
}
```

**State Management**:

```typescript
const [mounted, setMounted] = useState(false); // Hydration safety
const [file, setFile] = useState<File | null>(null); // Uploaded file
const [preview, setPreview] = useState<any[]>([]); // Preview rows with IDs
const [editingRowId, setEditingRowId] = useState<string | null>(null); // Current edit
const [editingData, setEditingData] = useState<any>(null); // Edit form data
const [activeStep, setActiveStep] = useState(0); // Current step (0-3)
```

### EditingRow Component

**Inline Edit Row Component** for editing individual rows in the table.

**Features**:

- TextField for text inputs (center_name, state, city)
- Select dropdown for enum values (exam_type, status)
- Save/Cancel buttons
- Immediate validation feedback

```tsx
function EditingRow({ row, rowIndex, onSave, onCancel }: EditingRowProps) {
  const [editRow, setEditRow] = useState(row);
  // Renders editable form fields in table row
}
```

---

## Data Flow

```
┌─────────────────────────────────────┐
│  User clicks "Import CSV"           │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Step 1: Download Template          │
│  - Generate CSV template            │
│  - Download to user's computer      │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Step 2: Upload File                │
│  - User selects CSV file            │
│  - Parse CSV into rows              │
│  - Show file info (name, size)      │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Step 3: Review & Edit              │
│  - Display table with preview rows  │
│  - User can edit/delete rows        │
│  - Validate individual fields       │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│  Step 4: Confirm & Import           │
│  - Show final summary               │
│  - POST each row to /api/exam-centers
│  - Display success/error results    │
└─────────────────────────────────────┘
```

---

## Inline Edit Workflow

```
User clicks Edit icon
         ↓
Row enters edit mode (highlighted)
Fields become editable textboxes/selects
         ↓
User modifies data
         ↓
User clicks Save or Cancel
         ↓
If Save: Update preview array, exit edit mode
If Cancel: Discard changes, exit edit mode
         ↓
Table re-renders with changes
```

---

## Editing Features Details

### Available Fields for Edit

| Field       | Type      | Options          |
| ----------- | --------- | ---------------- |
| Center Name | TextField | Any text         |
| Exam Type   | Select    | NATA, JEE, BOTH  |
| State       | TextField | Any state name   |
| City        | TextField | Any city name    |
| Status      | Select    | active, inactive |

### Edit Actions

| Action      | Button               | Effect                             |
| ----------- | -------------------- | ---------------------------------- |
| Start Edit  | Edit Icon (blue)     | Row becomes editable               |
| Save Edit   | Save Icon (green)    | Changes applied, edit mode exits   |
| Cancel Edit | Cancel Icon (orange) | Changes discarded, edit mode exits |
| Delete Row  | Delete Icon (red)    | Row removed from import list       |

### Visual Feedback

- **Editing Row**: Highlighted with background color
- **Edit Button**: Blue pencil icon in actions column
- **Save Button**: Green checkmark (appears during edit)
- **Cancel Button**: Orange X (appears during edit)
- **Status Chips**: Color-coded status (green=active, gray=inactive)
- **Exam Type Chips**: Color-coded exam type (blue=NATA, purple=JEE/BOTH)

---

## Error Handling

### File Upload Errors

- Invalid CSV format → Shows error alert
- File read failure → Displays error message
- No file selected → Disables Next button

### Data Validation

- Empty required fields → Can be edited before import
- Invalid exam types → Can be corrected in edit mode
- Duplicate centers → Warning shown after import

### Import Errors

- Network failure → Displays error alert
- API validation error → Shows in error list
- Partial success → Shows count of successes and failures
- All errors → Details available in error panel (scrollable)

---

## Hydration Safety

The component includes hydration protection:

```tsx
useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return null; // Don't render until hydration complete
}
```

This prevents "Text content does not match server-rendered HTML" errors.

---

## Integration with Page

### File: `page.tsx`

The enhanced modal is imported and used in the exam centers list page:

```tsx
import CSVImportModalEnhanced from "./CSVImportModalEnhanced";

// In the component:
{
  showCSVModal && (
    <CSVImportModalEnhanced
      onClose={() => setShowCSVModal(false)}
      onImportComplete={() => {
        setShowCSVModal(false);
        queryClient.invalidateQueries({ queryKey: ["exam_centers"] });
      }}
    />
  );
}
```

**Page also has hydration fix**:

```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) {
  return <CircularProgress />; // Loading state
}
```

---

## Material-UI Components Used

| Component     | Purpose                                  |
| ------------- | ---------------------------------------- |
| Dialog        | Main container                           |
| DialogTitle   | Header with gradient                     |
| DialogContent | Main content area                        |
| DialogActions | Action buttons                           |
| Stepper       | Step indicator                           |
| Table         | Data preview with editable rows          |
| TextField     | Inline edit fields                       |
| Select        | Dropdown for enum values                 |
| Alert         | Messages (info, success, error, warning) |
| Chip          | Status indicators                        |
| IconButton    | Edit, delete, save, cancel buttons       |
| Paper         | Containers, file upload area             |
| Card          | Info cards, summaries                    |
| Stack/Box     | Layout components                        |
| Typography    | Text content                             |
| Tooltip       | Hover help text                          |

---

## Icons Used

| Icon            | Use                        |
| --------------- | -------------------------- |
| FileUploadIcon  | Modal header               |
| CloudUploadIcon | Upload area, import button |
| InfoIcon        | Info alerts                |
| ErrorIcon       | Error alerts               |
| CheckCircleIcon | Success indicator          |
| WarningIcon     | Warning alerts             |
| DownloadIcon    | Download template button   |
| CloseIcon       | Close modal button         |
| EditIcon        | Edit row button            |
| SaveIcon        | Save edit button           |
| CancelIcon      | Cancel edit button         |
| DeleteIcon      | Delete row button          |

---

## API Integration

### Endpoints Used

#### POST /api/exam-centers

Creates a new exam center

**Request Body**:

```typescript
{
  center_name: string;
  center_code?: string;
  exam_type: "NATA" | "JEE" | "BOTH";
  state: string;
  city: string;
  address?: string;
  phone_number?: string;
  email?: string;
  status: "active" | "inactive";
  established_year?: number;
  contact_person?: string;
  // ... other fields
}
```

**Response**:

```typescript
{
  id: string;
  center_name: string;
  // ... created record
}
```

**Error Response**:

```typescript
{
  error: string; // Error message
}
```

### Error Handling in Import

```tsx
for (const row of preview) {
  const res = await fetch("/api/exam-centers", {
    method: "POST",
    body: JSON.stringify(centerData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    importErrors.push(`${centerData.center_name} - ${errorData.error}`);
    failed++;
  } else {
    success++;
  }
}
```

---

## Performance Considerations

### Optimizations

1. **Row IDs**: Each preview row gets a unique `row-{index}` ID for efficient React rendering
2. **Lazy Rendering**: Only active step content is rendered
3. **Scrollable Table**: Large datasets handled with scrollable container
4. **Efficient Updates**: Only changed rows are re-rendered during edits

### Limits

- **Preview Limit**: Currently shows all rows
- **Edit Limit**: One row can be edited at a time
- **Import Batch**: All rows sent sequentially (not parallel)

---

## Customization

### Change Step Count

```tsx
const steps = [
  "Download Template",
  "Upload File",
  "Review & Edit",
  "Confirm Import",
];
```

### Add More Edit Fields

In `EditingRow` component:

```tsx
<TableCell>
  <TextField
    size="small"
    value={editRow.newField || ""}
    onChange={(e) => setEditRow({ ...editRow, newField: e.target.value })}
    fullWidth
  />
</TableCell>
```

### Change Gradient Color

```tsx
sx={{
  background: "linear-gradient(135deg, #NEW_COLOR1 0%, #NEW_COLOR2 100%)",
}}
```

### Customize Validation

Modify `validateExamCenters` in `/lib/utils/csv-validator.ts`

---

## Troubleshooting

### Issue: Hydration Error on Page Load

**Solution**: The page.tsx now has:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <LoadingState />;
```

### Issue: Edit Changes Not Saving

**Check**:

- Click the green checkmark (Save) button
- Verify the row updates in the table
- Check browser console for errors

### Issue: Import Fails Silently

**Debug**:

1. Check network tab for API response
2. Verify data format in edit mode
3. Check error messages in result panel

### Issue: CSV Not Parsing

**Check**:

- CSV file format (comma-separated, proper headers)
- Required columns present
- No special characters breaking the file

---

## Testing Checklist

- [ ] Download template button works
- [ ] CSV file upload accepted
- [ ] Preview table displays correctly
- [ ] Edit button opens edit mode
- [ ] Fields are editable in edit mode
- [ ] Save button saves changes
- [ ] Cancel button discards changes
- [ ] Delete button removes rows
- [ ] Import button sends data
- [ ] Success message displays
- [ ] Error messages show (if any)
- [ ] Modal closes after import
- [ ] Page list refreshes with new data
- [ ] Responsive on mobile
- [ ] No console errors

---

## Future Enhancements

1. **Bulk Edit**: Select multiple rows and edit together
2. **Data Validation**: Show warnings for invalid data before import
3. **Drag & Drop**: Reorder rows before import
4. **Export Errors**: Download error report as CSV
5. **Template Customization**: Let users choose which columns to import
6. **Duplicate Detection**: Warn about duplicate centers
7. **Progress Bar**: Show import progress per row
8. **Import History**: Track and display previous imports

---

## Summary

The enhanced CSV Import Modal provides:

✅ Professional 4-step guided import process  
✅ Inline row editing with multiple field types  
✅ Row deletion for data cleanup  
✅ Beautiful Material Design UI  
✅ Comprehensive error handling  
✅ Hydration-safe implementation  
✅ Complete data preview before import  
✅ Responsive design for all devices

This feature significantly improves the bulk import experience for administrators!
