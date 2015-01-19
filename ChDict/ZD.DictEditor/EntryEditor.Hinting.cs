﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

using ZD.ChDict.Common;

namespace ZD.DictEditor
{
    partial class EntryEditor
    {
        private static string[] domains = new string[]
        {
            "(szó szerint)",
            "(kifejezés)",
            "(vulgáris)",
            "(tabu)",
            "(átirat)",
            "(családnév)",
            "(keresztnév)",
            "(földrajzi név)",
            "(tulajdonnév)",
        };

        private readonly List<string> zhoHints = new List<string>();

        /// <summary>
        /// Regex to find Chinese sequences:
        /// 茶壺|茶壶[cha2 hu2]
        /// </summary>
        private Regex reZho = new Regex(@"([\u2e80-\ufff0]+\|[\u2e80-\ufff0]+\[[^\]]+\]|[\u2e80-\ufff0]+\|[\u2e80-\ufff0]+|[\u2e80-\ufff0]+\[[^\]]+\]|\[[^\]]+\])");

		public void SetVocabulary(BackboneEntry be)
        {
            buildVocabulary(be.TransGoog);
            buildVocabulary(be.TransBing);
            string wikiHu = be.GetPart(BackbonePart.WikiHu) as string;
            if (wikiHu != null) buildVocabulary(wikiHu);
            TransTriple tt = be.GetPart(BackbonePart.WikiEn) as TransTriple;
			if (tt != null)
            {
                buildVocabulary(tt.Goog);
                buildVocabulary(tt.Bing);
            }
            tt = be.GetPart(BackbonePart.WikiDe) as TransTriple;
            if (tt != null)
            {
                buildVocabulary(tt.Goog);
                buildVocabulary(tt.Bing);
            }
            TransTriple[] tts = be.GetPart(BackbonePart.Cedict) as TransTriple[];
			if (tts != null)
            {
				foreach (TransTriple sense in tts)
                {
                    buildVocabulary(sense.Goog);
                    buildVocabulary(sense.Bing);
                    buildZhoHints(sense.Orig);
                }
            }
            tts = be.GetPart(BackbonePart.HanDeDict) as TransTriple[];
            if (tts != null)
            {
                foreach (TransTriple sense in tts)
                {
                    buildVocabulary(sense.Goog);
                    buildVocabulary(sense.Bing);
                }
            }
        }

        private void buildZhoHints(string str)
        {
            MatchCollection mc = reZho.Matches(str);
            foreach (Match m in mc)
                zhoHints.Add(m.Value);
        }

        private void buildVocabulary(string str)
        {
            HashSet<string> newVocab = new HashSet<string>();
            string[] parts = str.Split(new char[] { ' ' });
			foreach (string part in parts)
            {
				string[] xparts = part.Split(new char[]{ '-', '/'});
				foreach (string xpart in xparts)
				{
                    string trimmed = trimPunct(xpart);
					string lo = trimmed.ToLowerInvariant();
					if (lo.Length > 2) newVocab.Add(lo);
                }
			}
			if (newVocab.Count != 0) hints = mergeVocab(hints, newVocab);
        }

        private static string trimPunct(string str)
        {
            StringBuilder res = new StringBuilder();
            int i = 0;
            while (i < str.Length && char.IsPunctuation(str[i])) ++i;
            while (i < str.Length && !char.IsPunctuation(str[i])) { res.Append(str[i]); ++i; }
            return res.ToString();
        }

        private static string[] mergeVocab(string[] ovc, HashSet<string> nvc)
        {
            List<string> res = new List<string>(ovc.Length + nvc.Count);
            res.AddRange(ovc);
            foreach (string str in nvc) if (!res.Contains(str)) res.Add(str);
            return res.ToArray();
        }

        private List<string> getSpecialHints()
        {
            List<string> res = new List<string>();
            string txt = txtEntry.Text;
            bool domainHint = txtEntry.SelectionStart == 1 && txt == "(";
            if (!domainHint && txtEntry.SelectionStart > 2 && txt[txtEntry.SelectionStart - 1] == '(' && txt[txtEntry.SelectionStart - 2] == '\n')
                domainHint = true;
            if (domainHint) res.AddRange(domains);
            else
            {
                bool zhoHint = txtEntry.SelectionStart > 0 && txt[txtEntry.SelectionStart - 1] == '%';
                if (zhoHint) res.AddRange(zhoHints);
            }
            return res;
        }

        private List<string> getHints(string prefix)
        {
            List<string> res = new List<string>();
            if (prefix == string.Empty) return res;

            string lo = prefix.ToLowerInvariant();
            bool firstCap = char.IsUpper(prefix[0]);
            bool allCap = false;
            if (firstCap && prefix.Length > 1)
            {
                allCap = true;
                for (int i = 1; i != prefix.Length; ++i)
                {
                    if (!char.IsUpper(prefix[i]))
                    {
                        allCap = false;
                        break;
                    }
                }
            }

            foreach (string hint in hints)
            {
                if (hint.StartsWith(lo) && hint.Length > lo.Length)
                    res.Add(adjustHint(hint, firstCap, allCap));
            }

            return res;
        }

        private static string adjustHint(string hint, bool firstCap, bool allCap)
        {
            if (!firstCap) return hint;
            if (allCap) return hint.ToUpperInvariant();
            string adj = "";
            adj += char.ToUpperInvariant(hint[0]);
            adj += hint.Substring(1);
            return adj;
        }

        public void FillClassifierIfEmpty(BackboneEntry be)
        {
            if (txtEntry.Text != "") return;
            TransTriple[] tts = be.GetPart(BackbonePart.Cedict) as TransTriple[];
            if (tts == null) return;
            foreach (TransTriple tt in tts)
            {
                if (tt.Orig.StartsWith("CL:"))
                {
                    txtEntry.Text = tt.Orig.Replace("CL:", "SZ:");
                    return;
                }
            }
        }
    }
}
