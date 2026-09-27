import React, { useState } from 'react';
import { PoliceAlert } from '../types';
import { 
  Radio, 
  Mic, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  AlertOctagon, 
  BellRing, 
  PhoneCall, 
  ShieldAlert,
  CheckCircle,
  Megaphone
} from 'lucide-react';
import { 
  playPoliceRadioStatic, 
  speakDispatchAnnouncement, 
  playDispatchRadioChime 
} from '../services/soundSynthesizer';
import { sendPoliceMessageToUser, updateAlertStatus } from '../services/policeAlertService';

interface PoliceRadioCommsProps {
  alerts: PoliceAlert[];
  onRefresh: () => void;
}

export default function PoliceRadioComms({ alerts, onRefresh }: PoliceRadioCommsProps) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string>('BROADCAST_ALL');
  const [quickMessage, setQuickMessage] = useState('');
  const [voiceSynthEnabled, setVoiceSynthEnabled] = useState(true);
  const [lastTransmission, setLastTransmission] = useState<string | null>(
    'Radio Check: Arambagh PS Control Desk online. Frequency 156.800 MHz active.'
  );

  const activeAlerts = alerts.filter(
    a => a.status === 'PENDING' || a.status === 'DISPATCHED' || a.status === 'EN_ROUTE' || a.status === 'ON_SCENE'
  );

  const handleTransmit = (textToSend: string, isVoice = false) => {
    if (!textToSend.trim()) return;

    playPoliceRadioStatic(200);
    setLastTransmission(textToSend);

    // If voice synthesis is enabled, speak the transmission aloud
    if (voiceSynthEnabled && isVoice) {
      speakDispatchAnnouncement(textToSend);
    }

    if (selectedAlertId === 'BROADCAST_ALL') {
      activeAlerts.forEach(alert => {
        sendPoliceMessageToUser(alert.id, `🚨 [Hooghly Police Command]: ${textToSend}`, 'HQ Radio Controller');
      });
    } else {
      sendPoliceMessageToUser(selectedAlertId, `🚨 [Arambagh PS Radio]: ${textToSend}`, 'Duty Officer Desk');
    }

    onRefresh();
  };

  const handleRemoteSirenTrigger = (alert: PoliceAlert) => {
    playPoliceRadioStatic(150);
    const msg = '⚠️ ATTENTION PERPETRATOR: Police PCR Unit is in direct visual radius. Step back immediately!';
    sendPoliceMessageToUser(alert.id, msg, 'Tactical Intercept Team');
    setLastTransmission(`Triggered Remote Police Warning Beacon for ${alert.id}`);
    
    if (voiceSynthEnabled) {
      speakDispatchAnnouncement(`Warning. Police tactical unit approaching ${alert.userName} coordinates.`);
    }

    onRefresh();
  };

  return (
    <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-white uppercase tracking-wider">
                LIVE POLICE RADIO & DISPATCH COMMS
              </h3>
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> ON AIR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Direct Two-Way Tactical Channel to Citizen Mobile & Field Patrol Units
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceSynthEnabled(!voiceSynthEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              voiceSynthEnabled
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {voiceSynthEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice Synthesizer: {voiceSynthEnabled ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Quick Tactical Preset Radio Buttons */}
      <div className="space-y-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
          1-Click Tactical Radio Commands (Plays Radio Static + Transmits to User Screen):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            {
              label: '🚨 Code Red Intercept Broadcast',
              text: 'Attention All Units: Code Red distress verified. PCR Van 01 approaching with sirens and beacons.',
              voice: true,
              color: 'hover:border-red-500 bg-red-950/30 text-red-200'
            },
            {
              label: '🚔 Siren Flashlight Warning',
              text: 'Police unit is 300 meters away with flashing roof beacons. Attacker step back immediately.',
              voice: true,
              color: 'hover:border-amber-500 bg-amber-950/30 text-amber-200'
            },
            {
              label: '🛡️ Shakti QRT Team Deployment',
              text: 'Hooghly Shakti Women Quick Response Team has been dispatched. Hold your position in a lighted spot.',
              voice: true,
              color: 'hover:border-purple-500 bg-purple-950/30 text-purple-200'
            },
            {
              label: '📞 Direct Contact Established',
              text: 'Arambagh Police Duty Officer is attempting direct call. Keep phone line open.',
              voice: true,
              color: 'hover:border-indigo-500 bg-indigo-950/30 text-indigo-200'
            },
            {
              label: '✅ Safe Spot Direction Notice',
              text: 'Move towards nearest 24x7 shop or Netaji Bus Stand. Police personnel are already stationed there.',
              voice: false,
              color: 'hover:border-emerald-500 bg-emerald-950/30 text-emerald-200'
            },
            {
              label: '🎯 Target Coordinates Confirmed',
              text: 'GPS coordinates locked with 2.5m precision. Live escort en route.',
              voice: true,
              color: 'hover:border-blue-500 bg-blue-950/30 text-blue-200'
            }
          ].map((cmd, i) => (
            <button
              key={i}
              onClick={() => handleTransmit(cmd.text, cmd.voice)}
              className={`p-2.5 rounded-2xl border border-slate-800 text-left transition-all text-xs font-bold cursor-pointer hover:scale-[1.01] ${cmd.color}`}
            >
              <span className="block font-black text-white text-[11px] mb-0.5">{cmd.label}</span>
              <span className="block text-[10px] opacity-75 truncate">{cmd.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target Recipient & Custom Radio Message */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Transmit Channel:</span>
            <select
              value={selectedAlertId}
              onChange={(e) => setSelectedAlertId(e.target.value)}
              className="bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl border border-slate-700 outline-none cursor-pointer"
            >
              <option value="BROADCAST_ALL">📡 Broadcast to All Active Distress Cases ({activeAlerts.length})</option>
              {activeAlerts.map(a => (
                <option key={a.id} value={a.id}>
                  🎯 {a.id} - {a.userName} ({a.emergencyType})
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-400 text-[11px] font-mono">
            Frequency: 156.800 MHz • Bandwidth: FM-Wide
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type custom radio dispatch message to citizen & PCR team..."
            value={quickMessage}
            onChange={(e) => setQuickMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTransmit(quickMessage, true);
                setQuickMessage('');
              }
            }}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => {
              handleTransmit(quickMessage, true);
              setQuickMessage('');
            }}
            disabled={!quickMessage.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Transmit</span>
          </button>
        </div>

        {/* Last Audio Transmission Ticker */}
        {lastTransmission && (
          <div className="flex items-center gap-2 text-[11px] bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
            <span className="text-slate-400 font-bold shrink-0">Last Air Transmission:</span>
            <span className="text-white font-mono truncate italic">"{lastTransmission}"</span>
          </div>
        )}
      </div>
    </div>
  );
}
