import {
  House,
  MapTrifold,
  DownloadSimple,
  Gear,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  List,
  MapPin,
  MusicNote,
  Image as ImageIcon,
  TextT,
  Calendar,
  CheckCircle,
  ArrowsClockwise,
  WifiSlash,
  Globe,
  Trash,
  PencilSimple,
  Info,
  Warning,
  XCircle,
  Star,
  Heart,
  Play,
  Pause,
  Stop,
  Backpack,
  Eye,
  Video,
  CaretRight,
  CaretDown,
  NavigationArrow,
  ClockCountdown,
  Mountains,
  UsersThree,
  SignOut as SignOutIcon,
  Circle,
  PhoneCall,
  EnvelopeSimple
} from '@phosphor-icons/react';
import './Icon.css';

const iconMap = {
  home: House,
  map: MapTrifold,
  download: DownloadSimple,
  settings: Gear,
  back: ArrowLeft,
  forward: ArrowRight,
  check: Check,
  close: X,
  menu: List,
  location: MapPin,
  audio: MusicNote,
  image: ImageIcon,
  text: TextT,
  schedule: Calendar,
  activity: CheckCircle,
  sync: ArrowsClockwise,
  offline: WifiSlash,
  online: Globe,
  delete: Trash,
  edit: PencilSimple,
  info: Info,
  warning: Warning,
  error: XCircle,
  success: CheckCircle,
  star: Star,
  heart: Heart,
  play: Play,
  pause: Pause,
  stop: Stop,
  backpack: Backpack,
  eye: Eye,
  video: Video,
  'caret-right': CaretRight,
  'caret-down': CaretDown,
  'chevron-right': CaretRight,
  navigation: NavigationArrow,
  clock: ClockCountdown,
  mountains: Mountains,
  users: UsersThree,
  logout: SignOutIcon,
  spinner: Circle,
  phone: PhoneCall,
  email: EnvelopeSimple
};

export function Icon({
  name,
  size = 'medium',
  weight = 'regular',
  color,
  className = ''
}) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48
  };

  const pixelSize = sizeMap[size] || 24;

  const classes = [
    'icon',
    `icon--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <IconComponent
      className={classes}
      size={pixelSize}
      weight={weight}
      color={color}
    />
  );
}
