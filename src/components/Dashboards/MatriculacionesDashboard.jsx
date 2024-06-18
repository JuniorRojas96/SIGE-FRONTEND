import { useEffect, useState } from "react";
import { getMatricula, getGrados } from "../../services/AcademicoService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { CurrencyFormatter } from "../Constants";

const MatriculacionesDashboard = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;
      const search = ""; // Puedes ajustar el search si es necesario
      const page = ""; // Puedes ajustar el page si es necesario

      try {
        // Fetch grados to determine the first and last grades
        const gradosResponse = await getGrados();
        const grados = gradosResponse.data;
        const lastGrade = 9; //9no grado
        const firstGrade = 1; //1er grado

        const [currentYearResponse, lastYearResponse] = await Promise.all([
          getMatricula(currentYear, "", search, page),
          getMatricula(lastYear, "", search, page),
        ]);

        const currentYearMatriculas = currentYearResponse.data;
        const lastYearMatriculas = lastYearResponse.data;

        console.log("Matriculaciones ACTUALES: "+JSON.stringify(currentYearMatriculas));
        console.log("Matriculaciones pasadas: "+JSON.stringify(lastYearMatriculas));

        // Filter out first grade students from current year and last grade students from last year
        const lastYearMatriculasExcludingLastGrade = lastYearMatriculas.filter(
          (matricula) => matricula.id_grado.grado !== lastGrade
        );
        const currentYearMatriculasExcludingFirstGrade = currentYearMatriculas.filter(
          (matricula) => matricula.id_grado.grado !== firstGrade
        );

        const retainedStudents = currentYearMatriculasExcludingFirstGrade.filter((matricula) =>
          lastYearMatriculasExcludingLastGrade.some(
            (lastYearMatricula) =>
              lastYearMatricula.id_alumno.id_alumno === matricula.id_alumno.id_alumno
          )
        ).length;

        const retentionRate = (retainedStudents / lastYearMatriculasExcludingLastGrade.length) * 100;

        // Calculate new students rate
        const newStudentsCurrentYear = currentYearMatriculas.filter(
          (matricula) => !matricula.es_interno
        ).length;

        const newStudentsRate = (newStudentsCurrentYear / currentYearMatriculas.length) * 100;

        setData([
          {
            name: "Año Anterior: " + lastYear,
            Matriculaciones: lastYearMatriculas.length,
          },
          {
            name: "Año Actual: " + currentYear,
            Matriculaciones: currentYearMatriculas.length,
          },
        ]);

        setStats({
          retentionRate: retentionRate.toFixed(2),
          newStudentsRate: newStudentsRate.toFixed(2),
        });
      } catch (error) {
        console.error("Error fetching matriculas data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Estadísticas de matriculaciones</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Matriculaciones" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      <div>
        <h3>Porcentaje de Retención: {stats.retentionRate}%</h3>
        <h3>Porcentaje de Alumnos Nuevos: {stats.newStudentsRate}%</h3>
      </div>
    </div>
  );
};

export default MatriculacionesDashboard;
