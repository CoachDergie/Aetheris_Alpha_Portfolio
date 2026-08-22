export interface MartialMovement {
  name: string;
  type: string;
  met: number;
  focus: string;
  planet: string;
  desc: string;
  targetMuscles: string;
  formCues: string;
}

export const MARTIAL_MOVEMENTS: MartialMovement[] = [
  // Full-Body
  {
    name: 'Ascension Muscle-Up',
    type: 'Full-Body',
    met: 8.5,
    focus: 'Explosive Vertical Pull & Push',
    planet: 'Uranus / Chaos',
    desc: 'A dynamic fusion of a pull-up and a dip. Transitions the body from hanging below the bar to elevated above it in one fluid, explosive motion.',
    targetMuscles: 'Lats, Triceps, Core, Pectorals',
    formCues: 'Utilize a false grip. Pull explosively to the lower sternum, then rapidly roll the shoulders forward over the bar into a dip position.'
  },
  {
    name: 'Dragon-Stance Pistol Squat',
    type: 'Lower/Core',
    met: 8.0,
    focus: 'Unilateral Balance & Depth',
    planet: 'Earth / Nahemoth',
    desc: 'An advanced single-leg squat demanding profound balance, lower-body strength, and flexibility. Aligns the central axis with the grounding leg.',
    targetMuscles: 'Quadriceps, Glutes, Hamstrings, Core',
    formCues: 'Root the grounded heel firmly. Extend the non-working leg forward. Descend with control while maintaining an upright spinal column.'
  },
  {
    name: 'Suspended Iron Front Lever',
    type: 'Core/Arms',
    met: 7.5,
    focus: 'Static Horizontal Suspension',
    planet: 'Saturn / Satariel',
    desc: 'An elite static hold where the body is suspended horizontally facing upward, defying gravity purely through latitudinal tension and core fortitude.',
    targetMuscles: 'Lats, Core, Rhomboids, Posterior Deltoids',
    formCues: 'Retract and depress the scapula. Keep elbows locked straight. Point the toes and maintain a rigid, hollow body line parallel to the earth.'
  },
  {
    name: 'Anti-Gravity Planche',
    type: 'Upper/Push',
    met: 8.8,
    focus: 'Static Horizontal Press',
    planet: 'Sun / Thagirion',
    desc: 'A supreme demonstration of straight-arm pressing strength. The body floats parallel to the ground facing downward, balanced entirely on the hands.',
    targetMuscles: 'Anterior Deltoids, Pectorals, Core, Biceps',
    formCues: 'Protract the scapula entirely (rounded upper back). Lock elbows tight, lean forward aggressively until the feet naturally float off the ground.'
  },
  {
    name: 'Inverted Atlas Press (HSPU)',
    type: 'Shoulders/Full',
    met: 8.2,
    focus: 'Inverted Vertical Press',
    planet: 'Jupiter / Gha\'agsheblah',
    desc: 'A freestanding handstand push-up. Requires balancing the entire bodyweight inverted while pressing the earth away.',
    targetMuscles: 'Shoulders, Triceps, Upper Chest, Trapezius',
    formCues: 'Stack the hips directly over the shoulders. Maintain a hollow body. Descend until the crown of the head lightly taps the floor, then press back.'
  },
  {
    name: 'Suspended L-Sit',
    type: 'Core/Mixed',
    met: 6.5,
    focus: 'Abdominal Compression & Support',
    planet: 'Mercury / Samael',
    desc: 'A foundational static hold supporting the body on the hands with the legs extended straight out, forming a perfect 90-degree angle.',
    targetMuscles: 'Abdominals, Hip Flexors, Triceps, Quads',
    formCues: 'Actively depress the shoulders (pushing down). Lock elbows straight. Elevate and lock the knees, keeping the heels level with the hips.'
  },
  {
    name: 'Ma Bu Barbell Press',
    type: 'Mixed (Eastern)',
    met: 7.8,
    focus: 'Ma Bu (Rooted Horse Stance)',
    planet: 'Mars / Golachab',
    desc: 'Integrating deep pelvic floor breathing with barbell stabilization. Generates immense martial internal power (Fa Jin) while reinforcing bone density along the sagittal plane.',
    targetMuscles: 'Quadriceps, Core, Shoulders',
    formCues: 'Sink deep into a wide horse stance. Keep the spine vertical. Breathe into the lower Dan Tian while pressing the resistance forward.'
  },
  {
    name: 'Dragon Tail Levered Rotation',
    type: 'Mixed (Eastern)',
    met: 8.5,
    focus: 'Gong Bu (Bow Stance)',
    planet: 'Pluto / Thaumiel',
    desc: 'Utilizes the fulcrum of a long lever to build rotational oblique power and wrist fortification.',
    targetMuscles: 'Obliques, Forearms, Core, Hips',
    formCues: 'Shift weight between the front and back leg fluidly. Keep arms relatively straight to maximize the lever torque on the core.'
  }
];
