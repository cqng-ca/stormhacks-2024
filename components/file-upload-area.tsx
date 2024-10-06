'use client';
import { FileSpreadsheet } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";

const genders = ["Male", "Female", "Other"];

type Appointment = {
  id: number;
  gender: number;
  age: number;
  dateDiff: number;
  scholarship: boolean;
  diabetes: boolean;
  prediction: boolean | null;
  raw: string;
};

export default function FileUploadArea() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const fileUpload = useRef<HTMLInputElement | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const reader = new FileReader();
  reader.addEventListener("load", (event) => {
    if (typeof event.target?.result !== "string") return

    console.log(event.target.result)
    const appointments = event.target.result.split("\n").slice(1).map((line, i) => {
      const [gender, age, scholarship, hypertension, diabetes, alcoholism, handicap, sms, dateDiff, missedAppointmentBefore] = line.split(",");
      return {
        id: i,
        gender: parseInt(gender),
        age: parseInt(age),
        dateDiff: parseInt(dateDiff),
        scholarship: scholarship === "1",
        diabetes: diabetes === "1",
        prediction: null,
        raw: line,
      }
    });
    console.log(appointments);
    setAppointments(appointments);
    setLoading(false);
    appointments.forEach(async (appointment) => {
      const data: { prediction: number } = await (await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: JSON.stringify({ features: (appointment.raw + "," + "0, ".repeat(81).slice(0, -2)).split(",").map(x => parseInt(x)) }),
        mode: 'cors',
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json',
        }
      })).json()
      setAppointments(appointments.map((a) => {
        return a.id === appointment.id ? { ...a, prediction: !data.prediction } : a;
      }))
    });
  })

  const dropHandler = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer?.items) {
      for (const item of event.dataTransfer.items) {
        if (item.kind !== "file") continue;
        const itemAsFile = item.getAsFile();
        if (!itemAsFile) continue;
        const components = itemAsFile.name.split(".");
        if (components[components.length - 1].toLowerCase() !== "csv") continue;

        setFile(itemAsFile);
        break;
      }
    }
  }

  const uploadHandler = (event: ChangeEvent) => {
    if (!fileUpload.current) return;
    const itemAsFile = fileUpload.current.files?.[0];
    console.log({ itemAsFile })
    if (!itemAsFile) return;
    const components = itemAsFile.name.split(".");
    if (components[components.length - 1].toLowerCase() !== "csv") return;
    setFile(itemAsFile);
  }

  useEffect(() => {
    if (file !== null) reader.readAsText(file)
  }, [file]);

  return (
    file != null ? (loading ? <div>Loading...</div> : <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Gender</TableHead>
            <TableHead className="text-right">Age</TableHead>
            <TableHead>Days made in advance</TableHead>
            <TableHead>Has diabetes</TableHead>
            <TableHead>Scholarship received</TableHead>
            <TableHead>Likely to Show Up</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map(appointment =>
            <TableRow key={JSON.stringify(appointment)}>
              <TableCell>{genders[appointment.gender]}</TableCell>
              <TableCell className="text-right">{appointment.age}</TableCell>
              <TableCell>{appointment.dateDiff}</TableCell>
              <TableCell>{appointment.diabetes ? "Yes" : "No"}</TableCell>
              <TableCell>{appointment.scholarship ? "Yes" : "No"}</TableCell>
              <TableCell>{appointment.prediction === null ? "Analyzing..." : (appointment.prediction ? "Yes" : "No")}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

    </div>) :
      <div
        className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10 grow w-full"
        onDrop={e => dropHandler(e as unknown as DragEvent)}
        onDragOver={e => { e.preventDefault() }}
      >
        <div className="flex flex-row">
          <div className="text-center flex flex-col m-auto grow">
            <FileSpreadsheet aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
            <div className="mt-4 flex text-sm leading-6">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:underline"
              >
                <span>Upload</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={uploadHandler} ref={fileUpload} />
              </label>
              <p className="pl-1">or drag and drop a file</p>
            </div>
            <p className="text-xs leading-5">1 CSV file up to 250 MB</p>
          </div>
        </div>
      </div>
  )
}
