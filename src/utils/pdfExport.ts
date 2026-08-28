import { jsPDF } from 'jspdf';
import {
  NatalData,
  CelestialBody,
  PlanetaryAspect,
  LunarPhaseInfo,
  PunchTelemetry,
  QiGongBarbellSession,
  JournalEntry,
} from '../types';

export function generateAstrologyPdfReport(
  natal: NatalData,
  bodies: CelestialBody[],
  aspects: PlanetaryAspect[],
  lunar: LunarPhaseInfo,
  ascendant: { sign: string; deg: number; min: number },
  midheaven: { sign: string; deg: number; min: number },
  punches: PunchTelemetry[],
  barbellSession: QiGongBarbellSession,
  journalEntry: JournalEntry | null
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const footerY = pageHeight - 12;
  let yPos = 20;

  const drawPageBackground = () => {
    doc.setFillColor(15, 8, 28);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  const addPage = () => {
    doc.addPage();
    drawPageBackground();
    yPos = 20;
  };

  const ensureSpace = (height: number) => {
    if (yPos + height > footerY - 5) addPage();
  };

  const writeWrapped = (
    text: string,
    x: number,
    width: number,
    fontSize: number,
    color: [number, number, number],
    lineHeight = 4.5
  ) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, width);
    ensureSpace(lines.length * lineHeight);
    doc.text(lines, x, yPos);
    yPos += lines.length * lineHeight;
  };

  const writeSectionTitle = (title: string) => {
    ensureSpace(16);
    doc.setDrawColor(255, 69, 0);
    doc.setLineWidth(0.35);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    writeWrapped(title, margin, contentWidth, 11, [255, 165, 0], 5);
    yPos += 2;
  };

  drawPageBackground();

  doc.setFillColor(255, 69, 0);
  doc.rect(margin, 15, 4, 18, 'F');
  doc.setFont('helvetica', 'bold');
  writeWrapped(
    'AETHERIS V.1 // ESOTERIC & MARTIAL DOSSIER',
    margin + 9,
    contentWidth - 9,
    20,
    [255, 255, 255],
    7
  );
  doc.setFont('helvetica', 'normal');
  writeWrapped(
    `GENERATED: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC | OPENXR ENCRYPTED VAULT`,
    margin + 9,
    contentWidth - 9,
    9,
    [255, 140, 0],
    4
  );
  yPos += 4;

  writeSectionTitle('1. NATAL & CELESTIAL COORDINATES');
  writeWrapped(
    `Ascendant: ${ascendant.sign} ${ascendant.deg}°${ascendant.min}'`,
    margin,
    contentWidth,
    9,
    [210, 210, 220]
  );
  writeWrapped(
    `Midheaven: ${midheaven.sign} ${midheaven.deg}°${midheaven.min}'`,
    margin,
    contentWidth,
    9,
    [210, 210, 220]
  );
  writeWrapped(
    `Current Lunar Phase: ${lunar.phaseName} (${lunar.illumination}% illum) in ${lunar.currentSign}`,
    margin,
    contentWidth,
    9,
    [210, 210, 220]
  );

  writeSectionTitle('2. PLANETARY PLACEMENTS & QLIPHOTIC CORRESPONDENCES');
  bodies.slice(0, 8).forEach((body) => {
    const placement = `${body.name}: ${body.sign} ${body.degree}°${body.minute}' [House ${body.house}]`;
    const signature = `Qlipha: ${body.qliphoticSphere || 'N/A'} | ${body.darkSignature || 'N/A'}`;
    writeWrapped(placement, margin, contentWidth, 8.5, [255, 255, 255], 4);
    writeWrapped(signature, margin + 5, contentWidth - 5, 8, [180, 160, 210], 4);
    yPos += 1;
  });

  writeSectionTitle('3. ACTIVE SQUARES, OPPOSITIONS & MARTIAL TRANSITS');
  aspects.slice(0, 5).forEach((aspect) => {
    const summary = `${aspect.planet1} ${aspect.aspectType} ${aspect.planet2} (Orb: ${aspect.orb}°, Intensity: ${aspect.intensity})`;
    writeWrapped(`• ${summary}`, margin, contentWidth, 8.5, [255, 200, 150], 4);
    writeWrapped(aspect.esotericMeaning, margin + 5, contentWidth - 5, 8, [180, 180, 195], 4);
    yPos += 1;
  });

  writeSectionTitle('4. SIX-FOOT ZINC BARBELL QI-GONG & COMBAT TELEMETRY');
  const avgSpeed =
    punches.length > 0
      ? (punches.reduce((total, punch) => total + punch.speedMs, 0) / punches.length).toFixed(1)
      : '8.4';
  const avgReturn =
    punches.length > 0
      ? (punches.reduce((total, punch) => total + punch.returnTimeSec, 0) / punches.length).toFixed(3)
      : '0.280';
  const totalKcal =
    punches.reduce((total, punch) => total + punch.energyKcal, 0) + barbellSession.estimatedKcal;
  [
    `Practitioner Weight: ${barbellSession.userBodyWeightKg} kg | Barbell: ${barbellSession.barbellLengthFt}ft Solid Zinc (${barbellSession.barbellWeightKg} kg)`,
    `Movement: ${barbellSession.movementName} (${barbellSession.durationMinutes} min)`,
    `Recorded Strikes: ${punches.length} punches | Avg Speed: ${avgSpeed} m/s | Avg Return: ${avgReturn} s`,
    `Total Energy Expended: ${totalKcal.toFixed(1)} kCal`,
  ].forEach((line) => writeWrapped(line, margin, contentWidth, 8.5, [220, 220, 230]));

  writeSectionTitle('5. DAILY AFFIRMATION & MARTIAL INVOCATION');
  if (journalEntry) {
    writeWrapped(`Formula: "${journalEntry.barbarousFormula}"`, margin, contentWidth, 8.5, [255, 140, 0]);
    writeWrapped(`Invocation: "${journalEntry.invocationText}"`, margin, contentWidth, 8.5, [200, 200, 210]);
    writeWrapped(
      `Martial Correlation: ${journalEntry.martialCorrelation} (${journalEntry.focusQlipha})`,
      margin,
      contentWidth,
      8.5,
      [170, 150, 200]
    );
  } else {
    writeWrapped('No active transmission for this session.', margin, contentWidth, 8.5, [150, 150, 150]);
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 140);
    doc.text(
      'Aetheris OpenXR Telemetry Node • For Esoteric Research & Internal Martial Discipline',
      margin,
      footerY
    );
  }

  const fileName = `AETHERIS_ESOTERIC_REPORT_ALIGNMENT_${Date.now()}.pdf`;
  const dataUri = doc.output('datauristring');
  const downloadLink = document.createElement('a');
  downloadLink.href = dataUri;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
}
