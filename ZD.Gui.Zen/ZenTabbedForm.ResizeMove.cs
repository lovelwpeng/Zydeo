﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;
using System.Threading;

namespace ZD.Gui.Zen
{
    partial class ZenTabbedForm
    {
        /// <summary>
        /// Our hot areas that can be dragged.
        /// </summary>
        private enum DragMode
        {
            None,
            ResizeW,
            ResizeE,
            ResizeN,
            ResizeS,
            ResizeNW,
            ResizeSE,
            ResizeNE,
            ResizeSW,
            Move
        }

        /// <summary>
        /// Current drag mode (what is being dragged, if anything).
        /// </summary>
        private DragMode dragMode = DragMode.None;

        /// <summary>
        /// Mouse position when dragging started.
        /// </summary>
        private Point dragStart;

        /// <summary>
        /// Form location before dragging started.
        /// </summary>
        private Point formBeforeDragLocation;

        /// <summary>
        /// Form size before dragging started.
        /// </summary>
        private Size formBeforeDragSize;

        /// <summary>
        /// Find out which hot area, if any, a point in the form belongs to.
        /// </summary>
        private DragMode getDragArea(Point p)
        {
            Rectangle rHeader = new Rectangle(
                innerPadding,
                innerPadding,
                form.Width - 2 * innerPadding,
                headerHeight - innerPadding);
            if (rHeader.Contains(p))
                return DragMode.Move;
            Rectangle rEast = new Rectangle(
                form.Width - innerPadding,
                0,
                innerPadding,
                form.Height);
            if (rEast.Contains(p))
            {
                if (p.Y < 2 * innerPadding) return DragMode.ResizeNE;
                if (p.Y > form.Height - 2 * innerPadding) return DragMode.ResizeSE;
                return DragMode.ResizeE;
            }
            Rectangle rWest = new Rectangle(
                0,
                0,
                innerPadding,
                form.Height);
            if (rWest.Contains(p))
            {
                if (p.Y < 2 * innerPadding) return DragMode.ResizeNW;
                if (p.Y > form.Height - 2 * innerPadding) return DragMode.ResizeSW;
                // On the west, do not use border right next to main tab - 1px hot area looks silly
                if (p.X == 0 && p.Y >= mainTabCtrl.AbsTop && p.Y <= mainTabCtrl.AbsBottom)
                    return DragMode.None;
                return DragMode.ResizeW;
            }
            Rectangle rNorth = new Rectangle(
                0,
                0,
                form.Width,
                innerPadding);
            if (rNorth.Contains(p))
            {
                if (p.X < 2 * innerPadding) return DragMode.ResizeNW;
                if (p.X > form.Width - 2 * innerPadding) return DragMode.ResizeNE;
                return DragMode.ResizeN;
            }
            Rectangle rSouth = new Rectangle(
                0,
                form.Height - innerPadding,
                form.Width,
                innerPadding);
            if (rSouth.Contains(p))
            {
                if (p.X < 2 * innerPadding) return DragMode.ResizeSW;
                if (p.X > form.Width - 2 * innerPadding) return DragMode.ResizeSE;
                return DragMode.ResizeS;
            }
            return DragMode.None;
        }

        /// <summary>
        /// Handles moving and resizing related "mouse move" event.
        /// </summary>
        /// <returns>True if resize/move logic has handled event.</returns>
        private bool doMouseMoveRM(Point p)
        {
            // Window being moved by dragging at top
            Point loc = form.PointToScreen(p);
            if (dragMode == DragMode.Move)
            {
                int dx = loc.X - dragStart.X;
                int dy = loc.Y - dragStart.Y;
                Point newLocation = new Point(formBeforeDragLocation.X + dx, formBeforeDragLocation.Y + dy);
                ((Form)form.TopLevelControl).Location = newLocation;
                return true;
            }
            Size szForm = canvasSize;

            // Resize going on?
            Size? newSize = null;
            Point? newLoc = null;
            if (dragMode == DragMode.ResizeE)
            {
                int dx = loc.X - dragStart.X;
                Size sz = new Size(formBeforeDragSize.Width + dx, formBeforeDragSize.Height);
                Size dmin = clipDiffFromMinSize(sz);
                sz += dmin;
                if (szForm == sz) return true;
                newSize = sz;
            }
            else if (dragMode == DragMode.ResizeW)
            {
                int dx = loc.X - dragStart.X;
                int left = formBeforeDragLocation.X + dx;
                Size sz = new Size(formBeforeDragSize.Width - dx, formBeforeDragSize.Height);
                Size dmin = clipDiffFromMinSize(sz);
                sz += dmin;
                left -= dmin.Width;
                if (szForm == sz) return true;
                newSize = sz;
                newLoc = new Point(left, Location.Y);
            }
            else if (dragMode == DragMode.ResizeN)
            {
                int dy = loc.Y - dragStart.Y;
                int top = formBeforeDragLocation.Y + dy;
                Size sz = new Size(formBeforeDragSize.Width, formBeforeDragSize.Height - dy);
                Size dmin = clipDiffFromMinSize(sz);
                top -= dmin.Height;
                sz += dmin;
                if (szForm == sz) return true;
                newSize = sz;
                newLoc = new Point(Location.X, top);
            }
            else if (dragMode == DragMode.ResizeS)
            {
                int dy = loc.Y - dragStart.Y;
                Size sz = new Size(formBeforeDragSize.Width, formBeforeDragSize.Height + dy);
                Size dmin = clipDiffFromMinSize(sz);
                sz += dmin;
                if (szForm == sz) return true;
                newSize = sz;
            }
            else if (dragMode == DragMode.ResizeNW)
            {
                int dx = loc.X - dragStart.X;
                int dy = loc.Y - dragStart.Y;
                Size sz = new Size(formBeforeDragSize.Width - dx, formBeforeDragSize.Height - dy);
                Point pt = new Point(formBeforeDragLocation.X + dx, formBeforeDragLocation.Y + dy);
                Size dmin = clipDiffFromMinSize(sz);
                sz += dmin;
                pt.X -= dmin.Width;
                pt.Y -= dmin.Height;
                if (szForm == sz) return true;
                newSize = sz;
                newLoc = pt;
            }
            else if (dragMode == DragMode.ResizeSE)
            {
                int dx = loc.X - dragStart.X;
                int dy = loc.Y - dragStart.Y;
                Size sz = new Size(formBeforeDragSize.Width + dx, formBeforeDragSize.Height + dy);
                Size dmin = clipDiffFromMinSize(sz);
                sz += dmin;
                if (szForm == sz) return true;
                newSize = sz;
            }
            else if (dragMode == DragMode.ResizeNE)
            {
                int dx = loc.X - dragStart.X;
                int dy = loc.Y - dragStart.Y;
                Size sz = new Size(formBeforeDragSize.Width + dx, formBeforeDragSize.Height - dy);
                Point pt = new Point(formBeforeDragLocation.X, formBeforeDragLocation.Y + dy);
                Size dmin = clipDiffFromMinSize(sz);
                sz += dmin;
                pt.Y -= dmin.Height;
                if (szForm == sz) return true;
                newSize = sz;
                newLoc = pt;
            }
            else if (dragMode == DragMode.ResizeSW)
            {
                int dx = loc.X - dragStart.X;
                int dy = loc.Y - dragStart.Y;
                Size sz = new Size(formBeforeDragSize.Width - dx, formBeforeDragSize.Height + dy);
                Point pt = new Point(formBeforeDragLocation.X + dx, formBeforeDragLocation.Y);
                Size dmin = clipDiffFromMinSize(sz);
                sz += dmin;
                pt.X -= dmin.Width;
                if (szForm == sz) return true;
                newSize = sz;
                newLoc = pt;
            }
            else return false;

            if (newLoc.HasValue) form.Location = newLoc.Value;
            lock (resizeQueue) { resizeQueue.Add(newSize.Value); }
            ThreadPool.QueueUserWorkItem(doResizeWork);
            return true;
        }

        /// <summary>
        /// Latest size form should assume (the last element is the relevant one).
        /// </summary>
        private readonly List<Size> resizeQueue = new List<Size>();

        /// <summary>
        /// <para>Lock object around resize critical section</para>
        /// <para>If two ran in parallel, deadlock would occur b/c of contested canvas mutex.</para>
        /// </summary>
        private readonly object resizeWorkLO = new object();

        /// <summary>
        /// Do the heavy lifting of resizing in a worker thread: new canvas; rearrange; repaint; flush via invoke.
        /// </summary>
        private void doResizeWork(object ctxt)
        {
            lock (resizeWorkLO)
            {
                // Get last requested size. If we skipped a few interim sizes, too bad
                // We don't want to paint something that's no longer needed because window size has changed again.
                Size sz;
                lock (resizeQueue)
                {
                    if (resizeQueue.Count == 0) return;
                    sz = resizeQueue[resizeQueue.Count - 1];
                    resizeQueue.Clear();
                }
                doRecreateCanvas(sz);
                doRepaint();
                form.Invoke((MethodInvoker)delegate { form.Size = sz; form.Refresh(); });
            }
        }

        /// <summary>
        /// Updates cursor when over resize/move hot areas (but not being resized/move yet).
        /// </summary>
        private void doMouseMoveRMCursor(Point p)
        {
            // Switch cursor when moving over resize hot areas in border
            var area = getDragArea(p);
            if (area == DragMode.ResizeW || area == DragMode.ResizeE)
                form.Cursor = Cursors.SizeWE;
            else if (area == DragMode.ResizeN || area == DragMode.ResizeS)
                form.Cursor = Cursors.SizeNS;
            else if (area == DragMode.ResizeNW || area == DragMode.ResizeSE)
                form.Cursor = Cursors.SizeNWSE;
            else if (area == DragMode.ResizeNE || area == DragMode.ResizeSW)
                form.Cursor = Cursors.SizeNESW;
            else form.Cursor = Cursors.Arrow;
        }

        /// <summary>
        /// Takes a size, and calculates difference from real (scaled) minimum size if smaller.
        /// In dimension that's OK, returns 0.
        /// </summary>
        private Size clipDiffFromMinSize(Size sz)
        {
            int w = (int)(((float)logicalMinimumSize.Width) * Scale);
            int h = (int)(((float)logicalMinimumSize.Height) * Scale);
            if (sz.Width < w) w = w - sz.Width;
            else w = 0;
            if (logicalMinimumSize.Width == 0) w = 0;
            if (sz.Height < h) h = h - sz.Height;
            else h = 0;
            if (logicalMinimumSize.Height == 0) h = 0;
            return new Size(w, h);
        }

        /// <summary>
        /// Handle "mouse up" event for end of resize/move.
        /// </summary>
        private void doMouseUpRM()
        {
            // Have been resizing or moving? Indicate it's now done.
            if (dragMode != DragMode.None) DoMoveResizeFinished();
            // Resize by dragging border ends
            dragMode = DragMode.None;
        }

        /// <summary>
        /// Handle "mouse down" event for start of resize/move.
        /// </summary>
        private void doMouseDownRM(Point p)
        {
            // Resizing at window border
            var area = getDragArea(p);
            if (area == DragMode.Move)
            {
                dragMode = DragMode.Move;
                dragStart = form.PointToScreen(p);
                formBeforeDragLocation = form.Location;
            }
            else if (area != DragMode.None && area != DragMode.Move)
            {
                dragMode = area;
                dragStart = form.PointToScreen(p);
                formBeforeDragSize = form.Size;
                formBeforeDragLocation = form.Location;
            }
        }
    }
}
